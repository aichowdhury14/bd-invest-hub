import type { LucideIcon } from "lucide-react";
import { Crown, Gauge, LineChart, ShieldCheck, Zap } from "lucide-react";
import type { ProductType } from "@prisma/client";
import type { SerializedProduct } from "@/lib/serialize";
import { calculateDPSMaturity, calculateLumpSumMaturity } from "@/lib/calculations";
import { isRecurringProduct, type BankingMode } from "@/lib/labels";

export type RiskProfile = "CONSERVATIVE" | "BALANCED" | "GROWTH";

export interface Row {
  product: SerializedProduct;
  tier: SerializedProduct["rateTiers"][number] | null;
  maturityAmount: number | null;
  totalContribution: number | null;
  totalInterest: number | null;
}

export interface Picks {
  bestOverall: Row | null;
  safest: Row | null;
  bestBank: Row | null;
  bestNBFI: Row | null;
  bestSafe: Row | null;
}

export interface Recommendation {
  key: string;
  icon: LucideIcon;
  label: string;
  row: Row | null;
  reasoning: string;
}

export interface RecommendParams {
  amount: number;
  tenureMonths: number;
  typeFilter: ProductType | "ALL";
  riskProfile: RiskProfile;
  bankingMode?: BankingMode;
}

/**
 * Builds the same ranked rows/picks/recommendations the calculator page shows,
 * from live rate data only — no numbers here are invented or LLM-generated.
 * Shared by the calculator page and the natural-language assistant so both
 * surfaces are guaranteed to agree on any given amount/tenure/filter.
 */
export function buildRecommendations(
  products: SerializedProduct[],
  params: RecommendParams
): { rows: Row[]; picks: Picks; recommendations: Recommendation[] } {
  const { amount, tenureMonths, typeFilter, riskProfile, bankingMode = "ALL" } = params;

  const rows: Row[] = products
    .filter((p) => typeFilter === "ALL" || p.productType === typeFilter)
    .filter((p) =>
      bankingMode === "ALL" ? true : bankingMode === "ISLAMIC" ? p.isIslamic : !p.isIslamic
    )
    .map((product) => {
      const tier =
        product.rateTiers.find(
          (t) =>
            t.tenureMonths === tenureMonths &&
            amount >= t.minAmount &&
            (t.maxAmount === null || amount <= t.maxAmount)
        ) ?? null;

      if (!tier || amount <= 0) {
        return { product, tier: null, maturityAmount: null, totalContribution: null, totalInterest: null };
      }

      if (isRecurringProduct(product.productType)) {
        const result = calculateDPSMaturity({
          monthlyDeposit: amount,
          annualRatePct: tier.interestRatePct,
          tenureMonths,
          compounding: product.compounding,
        });
        return {
          product,
          tier,
          maturityAmount: result.maturityAmount,
          totalContribution: result.totalDeposited,
          totalInterest: result.totalInterest,
        };
      }

      const result = calculateLumpSumMaturity({
        principal: amount,
        annualRatePct: tier.interestRatePct,
        tenureMonths,
        compounding: product.compounding,
      });
      return {
        product,
        tier,
        maturityAmount: result.maturityAmount,
        totalContribution: result.principal,
        totalInterest: result.totalInterest,
      };
    })
    .sort((a, b) => (b.maturityAmount ?? -1) - (a.maturityAmount ?? -1));

  const offered = rows.filter((r) => r.tier !== null);
  // Digital banks are regulated, deposit-insured banks under a different
  // channel — grouped with BANK here so they compete for "Best at a bank"
  // rather than getting a dedicated pick slot the fixed 3-card layouts don't
  // have room for yet.
  const byType = (type: "GOVERNMENT" | "BANK" | "INVESTMENT_ORG") =>
    offered.find((r) =>
      type === "BANK"
        ? r.product.institutionType === "BANK" || r.product.institutionType === "DIGITAL_BANK"
        : r.product.institutionType === type
    ) ?? null;
  const bestOverall = offered[0] ?? null;
  const safest = byType("GOVERNMENT");
  const bestBank = byType("BANK");
  const bestNBFI = byType("INVESTMENT_ORG");
  const bestSafe =
    [safest, bestBank]
      .filter((r): r is Row => r !== null)
      .sort((a, b) => (b.maturityAmount ?? -1) - (a.maturityAmount ?? -1))[0] ?? null;
  const picks: Picks = { bestOverall, safest, bestBank, bestNBFI, bestSafe };

  const recommendations: Recommendation[] = buildRecommendationCards(riskProfile, picks);

  return { rows, picks, recommendations };
}

/**
 * Which 3 cards to show depends on the chosen risk tolerance — a transparent,
 * rule-based reordering of the same live-rate data, not a hidden scoring model.
 */
function buildRecommendationCards(riskProfile: RiskProfile, picks: Picks): Recommendation[] {
  if (riskProfile === "CONSERVATIVE") {
    return [
      { key: "safe", icon: ShieldCheck, label: "Capital-safe pick", row: picks.bestSafe, reasoning: "Best rate among government and bank options only — no NBFI/investment-org risk." },
      { key: "safest", icon: Gauge, label: "Safest choice", row: picks.safest, reasoning: "Government-backed — Bangladesh Bank / National Savings Directorate instruments carry sovereign backing." },
      { key: "bank", icon: LineChart, label: "Best at a bank", row: picks.bestBank, reasoning: "Highest-rate regulated commercial bank option at this amount and tenure." },
    ];
  }
  if (riskProfile === "GROWTH") {
    return [
      { key: "overall", icon: Crown, label: "Best overall return", row: picks.bestOverall, reasoning: "Highest maturity amount across every tracked institution at this amount and tenure." },
      { key: "nbfi", icon: Zap, label: "Highest-rate NBFI", row: picks.bestNBFI, reasoning: "Investment organizations/NBFIs often price above banks — carries different risk than a bank or government instrument." },
      { key: "bank", icon: LineChart, label: "Best at a bank", row: picks.bestBank, reasoning: "Highest-rate regulated commercial bank option at this amount and tenure." },
    ];
  }
  return [
    { key: "overall", icon: Crown, label: "Best overall return", row: picks.bestOverall, reasoning: "Highest maturity amount across every tracked institution at this amount and tenure." },
    { key: "safest", icon: ShieldCheck, label: "Safest choice", row: picks.safest, reasoning: "Government-backed — Bangladesh Bank / National Savings Directorate instruments carry sovereign backing." },
    { key: "bank", icon: LineChart, label: "Best at a bank", row: picks.bestBank, reasoning: "Highest-rate regulated commercial bank option at this amount and tenure." },
  ];
}
