// Goal-based solving: given a target maturity amount and a tenure, find the
// deposit needed to reach it. Both calculateLumpSumMaturity and
// calculateDPSMaturity are linear in the deposit (maturity = deposit × growth
// factor), so this inverts them exactly — no iterative search, no estimate.

import type { LucideIcon } from "lucide-react";
import { Crown, LineChart, ShieldCheck, Zap } from "lucide-react";
import type { ProductType } from "@prisma/client";
import { dpsGrowthFactor, lumpSumGrowthFactor, type Compounding } from "@/lib/calculations";
import type { SerializedProduct } from "@/lib/serialize";
import { isRecurringProduct } from "@/lib/labels";

export interface GoalInput {
  targetAmount: number;
  annualRatePct: number;
  tenureMonths: number;
  compounding: Compounding;
}

export interface GoalResult {
  /** The one-time deposit needed today to reach targetAmount by maturity. */
  requiredLumpSum: number;
  /** The fixed monthly deposit needed to reach targetAmount by maturity. */
  requiredMonthlyDeposit: number;
}

/**
 * Solves both directions for a given rate/tenure: what lump sum, and what
 * monthly DPS deposit, would each independently grow to targetAmount.
 */
export function solveForGoal(input: GoalInput): GoalResult {
  const { targetAmount, annualRatePct, tenureMonths, compounding } = input;
  if (targetAmount <= 0 || annualRatePct < 0 || tenureMonths <= 0) {
    throw new RangeError("targetAmount, tenureMonths must be > 0 and annualRatePct >= 0");
  }

  // Unrounded growth factors, shared with calculateLumpSumMaturity/
  // calculateDPSMaturity — inverting the same formula those use, not a
  // separate approximation.
  const lumpSumFactor = lumpSumGrowthFactor(annualRatePct, tenureMonths, compounding);
  const monthlyDpsFactor = dpsGrowthFactor(annualRatePct, tenureMonths, compounding);

  return {
    requiredLumpSum: roundToPaisa(targetAmount / lumpSumFactor),
    requiredMonthlyDeposit: roundToPaisa(targetAmount / monthlyDpsFactor),
  };
}

function roundToPaisa(value: number): number {
  return Math.round(value * 100) / 100;
}

export interface GoalRow {
  product: SerializedProduct;
  tier: SerializedProduct["rateTiers"][number] | null;
  /** The deposit needed with this product to reach the target — a one-time
   *  lump sum for lump-sum rows, a fixed monthly amount for DPS rows. null
   *  when not offered at this tenure. */
  requiredDeposit: number | null;
}

export interface GoalPicks {
  cheapestLumpSum: GoalRow | null;
  cheapestDPS: GoalRow | null;
  cheapestLumpSumBank: GoalRow | null;
  cheapestDPSBank: GoalRow | null;
}

export interface GoalRecommendation {
  key: string;
  icon: LucideIcon;
  label: string;
  row: GoalRow | null;
  reasoning: string;
}

export interface GoalRecommendationGroup {
  title: string;
  cards: GoalRecommendation[];
}

export interface GoalRecommendParams {
  targetAmount: number;
  tenureMonths: number;
  typeFilter: ProductType | "ALL";
}

function buildGoalRow(
  product: SerializedProduct,
  targetAmount: number,
  tenureMonths: number
): GoalRow {
  const tier = product.rateTiers.find((t) => t.tenureMonths === tenureMonths) ?? null;
  if (!tier || targetAmount <= 0) {
    return { product, tier: null, requiredDeposit: null };
  }

  const { requiredLumpSum, requiredMonthlyDeposit } = solveForGoal({
    targetAmount,
    annualRatePct: tier.interestRatePct,
    tenureMonths,
    compounding: product.compounding,
  });
  const requiredDeposit = isRecurringProduct(product.productType)
    ? requiredMonthlyDeposit
    : requiredLumpSum;

  return { product, tier, requiredDeposit };
}

/**
 * For every product offered at tenureMonths, solves the deposit needed to
 * reach targetAmount. Lump-sum products (a single deposit) and DPS products
 * (a recurring monthly deposit) are never ranked against each other — a
 * monthly figure and a one-time figure aren't comparable commitments even
 * when the raw numbers look similar, so each group gets its own ascending
 * ranking ("lowest deposit required" = best deal within that group). Same
 * no-hidden-scoring shape as buildRecommendations in recommend.ts.
 */
export function buildGoalRecommendations(
  products: SerializedProduct[],
  params: GoalRecommendParams
): {
  lumpSumRows: GoalRow[];
  dpsRows: GoalRow[];
  picks: GoalPicks;
  groups: GoalRecommendationGroup[];
} {
  const { targetAmount, tenureMonths, typeFilter } = params;

  const filtered = products.filter((p) => typeFilter === "ALL" || p.productType === typeFilter);
  const byRequiredDeposit = (a: GoalRow, b: GoalRow) =>
    (a.requiredDeposit ?? Infinity) - (b.requiredDeposit ?? Infinity);

  const lumpSumRows = filtered
    .filter((p) => !isRecurringProduct(p.productType))
    .map((product) => buildGoalRow(product, targetAmount, tenureMonths))
    .sort(byRequiredDeposit);

  const dpsRows = filtered
    .filter((p) => isRecurringProduct(p.productType))
    .map((product) => buildGoalRow(product, targetAmount, tenureMonths))
    .sort(byRequiredDeposit);

  const offeredLumpSum = lumpSumRows.filter((r) => r.tier !== null);
  const offeredDPS = dpsRows.filter((r) => r.tier !== null);
  // Digital banks are regulated banks under a different channel — grouped
  // with BANK here, same as recommend.ts's byType helper.
  const cheapestBankIn = (rows: GoalRow[]) =>
    rows
      .filter((r) => r.product.institutionType === "BANK" || r.product.institutionType === "DIGITAL_BANK")
      .sort(byRequiredDeposit)[0] ?? null;

  const picks: GoalPicks = {
    cheapestLumpSum: offeredLumpSum[0] ?? null,
    cheapestDPS: offeredDPS[0] ?? null,
    cheapestLumpSumBank: cheapestBankIn(offeredLumpSum),
    cheapestDPSBank: cheapestBankIn(offeredDPS),
  };

  const groups: GoalRecommendationGroup[] = [
    {
      title: "One-time deposit",
      cards: [
        {
          key: "lumpsum-cheapest",
          icon: Crown,
          label: "Lowest deposit overall",
          row: picks.cheapestLumpSum,
          reasoning:
            picks.cheapestLumpSum?.product.institutionType === "GOVERNMENT"
              ? "Government-backed and needs the smallest deposit — Bangladesh Bank / National Savings Directorate instruments carry sovereign backing."
              : "The smallest single deposit today that reaches this goal by maturity.",
        },
        {
          key: "lumpsum-bank",
          icon: LineChart,
          label: "Lowest at a bank",
          row: picks.cheapestLumpSumBank,
          reasoning: "The smallest deposit needed among regulated commercial banks for this goal.",
        },
      ],
    },
    {
      title: "Monthly deposit (DPS)",
      cards: [
        {
          key: "dps-cheapest",
          icon: Zap,
          label: "Lowest deposit overall",
          row: picks.cheapestDPS,
          reasoning: "The smallest fixed monthly deposit that reaches this goal by maturity.",
        },
        {
          key: "dps-bank",
          icon: ShieldCheck,
          label: "Lowest at a bank",
          row: picks.cheapestDPSBank,
          reasoning: "The smallest monthly deposit among regulated commercial banks for this goal.",
        },
      ],
    },
  ];

  return { lumpSumRows, dpsRows, picks, groups };
}
