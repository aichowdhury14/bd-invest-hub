"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Crown,
  ExternalLink,
  Gauge,
  LineChart,
  Percent,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { SerializedProduct } from "@/lib/serialize";
import {
  calculateDPSMaturity,
  calculateLumpSumMaturity,
  dpsGrowthSeries,
  lumpSumGrowthSeries,
} from "@/lib/calculations";
import { institutionTypeLabels, isRecurringProduct, productTypeLabels } from "@/lib/labels";
import { institutionTypeStyle } from "@/lib/institution-style";
import { useSessionId } from "@/lib/useSessionId";
import { trackCalculatorUse } from "@/lib/analytics";
import type { ProductType } from "@prisma/client";
import {
  AIT_RATES,
  CURRENT_INFLATION,
  aitRateForStatus,
  realRatePct,
  type TaxStatus,
} from "@/lib/economic-context";
import { GrowthChart } from "./GrowthChart";

type RiskProfile = "CONSERVATIVE" | "BALANCED" | "GROWTH";

const bdt = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

function formatTenure(months: number): string {
  if (months % 12 === 0) {
    const years = months / 12;
    return `${months} mo (${years} year${years > 1 ? "s" : ""})`;
  }
  return `${months} mo`;
}

interface Row {
  product: SerializedProduct;
  tier: SerializedProduct["rateTiers"][number] | null;
  maturityAmount: number | null;
  totalContribution: number | null;
  totalInterest: number | null;
}

export function CalculatorClient({ products }: { products: SerializedProduct[] }) {
  const tenureOptions = useMemo(() => {
    const set = new Set<number>();
    for (const product of products) {
      for (const tier of product.rateTiers) set.add(tier.tenureMonths);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [products]);

  const productTypes = useMemo(() => {
    const set = new Set<ProductType>();
    for (const product of products) set.add(product.productType);
    return Array.from(set);
  }, [products]);

  const [amount, setAmount] = useState(100000);
  const [tenureIndex, setTenureIndex] = useState(() => {
    const defaultIdx = tenureOptions.indexOf(12);
    return defaultIdx >= 0 ? defaultIdx : 0;
  });
  const [typeFilter, setTypeFilter] = useState<ProductType | "ALL">("ALL");
  const [riskProfile, setRiskProfile] = useState<RiskProfile>("BALANCED");
  const [taxStatus, setTaxStatus] = useState<TaxStatus>("TIN");
  const sessionId = useSessionId();

  const tenureMonths = tenureOptions[tenureIndex] ?? 0;

  const rows: Row[] = useMemo(() => {
    return products
      .filter((p) => typeFilter === "ALL" || p.productType === typeFilter)
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
  }, [products, typeFilter, tenureMonths, amount]);

  const topMaturity = rows.find((r) => r.maturityAmount !== null)?.maturityAmount ?? null;

  const picks = useMemo(() => {
    const offered = rows.filter((r) => r.tier !== null);
    const byType = (type: "GOVERNMENT" | "BANK" | "INVESTMENT_ORG") =>
      offered.find((r) => r.product.institutionType === type) ?? null;
    const bestOverall = offered[0] ?? null;
    const safest = byType("GOVERNMENT");
    const bestBank = byType("BANK");
    const bestNBFI = byType("INVESTMENT_ORG");
    const bestSafe =
      [safest, bestBank]
        .filter((r): r is Row => r !== null)
        .sort((a, b) => (b.maturityAmount ?? -1) - (a.maturityAmount ?? -1))[0] ?? null;
    return { bestOverall, safest, bestBank, bestNBFI, bestSafe };
  }, [rows]);

  /**
   * Which 3 cards to show depends on the chosen risk tolerance — a transparent,
   * rule-based reordering of the same live-rate data, not a hidden scoring model.
   */
  const recommendations = useMemo(() => {
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
  }, [riskProfile, picks]);

  const topPick = picks.bestOverall;

  const growthSeries = useMemo(() => {
    const pick = topPick;
    if (!pick || !pick.tier || amount <= 0) return null;
    if (isRecurringProduct(pick.product.productType)) {
      return dpsGrowthSeries({
        monthlyDeposit: amount,
        annualRatePct: pick.tier.interestRatePct,
        tenureMonths,
        compounding: pick.product.compounding,
      });
    }
    return lumpSumGrowthSeries({
      principal: amount,
      annualRatePct: pick.tier.interestRatePct,
      tenureMonths,
      compounding: pick.product.compounding,
    });
  }, [topPick, amount, tenureMonths]);

  /** Net-of-tax and inflation-adjusted context for the top pick — real, sourced figures. */
  const taxAndInflation = useMemo(() => {
    if (!topPick || !topPick.tier || topPick.totalInterest === null || topPick.maturityAmount === null) {
      return null;
    }
    const aitPct = aitRateForStatus(taxStatus);
    const netInterest = topPick.totalInterest * (1 - aitPct / 100);
    const netMaturity = (topPick.totalContribution ?? 0) + netInterest;
    return {
      aitPct,
      netInterest,
      netMaturity,
      nominalRatePct: topPick.tier.interestRatePct,
      realRatePct: realRatePct(topPick.tier.interestRatePct),
    };
  }, [topPick, taxStatus]);

  useEffect(() => {
    if (!sessionId || amount <= 0 || tenureMonths <= 0) return;
    const handle = setTimeout(() => {
      trackCalculatorUse({ sessionId, amount, tenureMonths });
    }, 800);
    return () => clearTimeout(handle);
  }, [sessionId, amount, tenureMonths]);

  if (tenureOptions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
        No rate data has been added yet, so there is nothing to calculate. Check back once the
        admin has added institutions and rates.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl card-surface p-5 sm:p-7 shadow-sm grid gap-7 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-semibold">
            {typeFilter === "ALL"
              ? "Amount (lump sum — treated as the monthly deposit for DPS rows)"
              : isRecurringProductType(typeFilter)
                ? "Amount (per month)"
                : "Amount (BDT)"}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted font-display font-semibold">
              ৳
            </span>
            <input
              id="amount"
              type="number"
              min={0}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-transparent pl-8 pr-3 py-2.5 text-lg font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-end"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="tenure" className="font-semibold">
              Tenure
            </label>
            <span className="tabular-nums rounded-full bg-foreground/5 px-2.5 py-0.5 text-xs font-semibold">
              {formatTenure(tenureMonths)}
            </span>
          </div>
          <input
            id="tenure"
            type="range"
            min={0}
            max={tenureOptions.length - 1}
            step={1}
            value={tenureIndex}
            onChange={(e) => setTenureIndex(Number(e.target.value))}
            className="w-full accent-current h-2 mt-3.5"
            style={{ color: "var(--brand-end)" }}
          />
          <div className="flex justify-between text-xs text-muted">
            <span>{formatTenure(tenureOptions[0])}</span>
            <span>{formatTenure(tenureOptions[tenureOptions.length - 1])}</span>
          </div>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="type" className="text-sm font-semibold">
            Product type
          </label>
          <div className="flex flex-wrap gap-2">
            <FilterChip active={typeFilter === "ALL"} onClick={() => setTypeFilter("ALL")}>
              All types
            </FilterChip>
            {productTypes.map((type) => (
              <FilterChip key={type} active={typeFilter === type} onClick={() => setTypeFilter(type)}>
                {productTypeLabels[type]}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-muted" />
            Risk tolerance
          </label>
          <div className="flex flex-wrap gap-2">
            <FilterChip active={riskProfile === "CONSERVATIVE"} onClick={() => setRiskProfile("CONSERVATIVE")}>
              Conservative
            </FilterChip>
            <FilterChip active={riskProfile === "BALANCED"} onClick={() => setRiskProfile("BALANCED")}>
              Balanced
            </FilterChip>
            <FilterChip active={riskProfile === "GROWTH"} onClick={() => setRiskProfile("GROWTH")}>
              Growth
            </FilterChip>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-1.5">
            <Percent className="h-3.5 w-3.5 text-muted" />
            Tax status (for net-of-tax figures)
          </label>
          <div className="flex flex-wrap gap-2">
            <FilterChip active={taxStatus === "TIN"} onClick={() => setTaxStatus("TIN")}>
              Have TIN ({AIT_RATES.withTin}%)
            </FilterChip>
            <FilterChip active={taxStatus === "NO_TIN"} onClick={() => setTaxStatus("NO_TIN")}>
              No TIN ({AIT_RATES.withoutTin}%)
            </FilterChip>
            <FilterChip active={taxStatus === "EXEMPT"} onClick={() => setTaxStatus("EXEMPT")}>
              Tax-exempt
            </FilterChip>
          </div>
        </div>
      </div>

      {recommendations.some((r) => r.row) && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h2 className="font-display font-bold">Smart Recommendations</h2>
            <span className="text-xs text-muted">
              — ranked from today&apos;s live rates for a {riskProfile.toLowerCase()} profile, not a
              prediction
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.key}
                icon={rec.icon}
                label={rec.label}
                row={rec.row}
                reasoning={rec.reasoning}
              />
            ))}
          </div>
        </div>
      )}

      {growthSeries && topPick && (
        <div className="rounded-2xl card-surface p-5 sm:p-7 shadow-sm space-y-4">
          <div>
            <h2 className="font-display font-bold">
              How your money grows — {topPick.product.institutionName}
            </h2>
            <p className="text-sm text-muted mt-0.5">
              {topPick.product.name}, {topPick.tier?.interestRatePct.toFixed(2)}% over{" "}
              {formatTenure(tenureMonths)}
            </p>
          </div>
          <GrowthChart series={growthSeries} />

          {taxAndInflation && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-border">
              <div className="flex items-start gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-foreground/5 text-muted">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">
                    Real return: {taxAndInflation.realRatePct.toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted leading-relaxed">
                    {taxAndInflation.nominalRatePct.toFixed(2)}% nominal minus{" "}
                    {CURRENT_INFLATION.ratePct}% inflation ({CURRENT_INFLATION.period}, {CURRENT_INFLATION.source}
                    ) — approximate, not compounded.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-foreground/5 text-muted">
                  <Percent className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">
                    After tax ({taxAndInflation.aitPct}% AIT): {bdt.format(taxAndInflation.netMaturity)}
                  </p>
                  <p className="text-xs text-muted leading-relaxed">
                    Net interest {bdt.format(taxAndInflation.netInterest)} — source tax under NBR Income
                    Tax Ordinance s.53F, deducted at the bank before payout.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl card-surface shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-foreground/[0.03] text-left">
            <tr>
              <th className="px-4 py-3.5 font-semibold">Institution</th>
              <th className="px-4 py-3.5 font-semibold">Product</th>
              <th className="px-4 py-3.5 font-semibold text-right">Rate</th>
              <th className="px-4 py-3.5 font-semibold text-right">Maturity amount</th>
              <th className="px-4 py-3.5 font-semibold text-right">Interest earned</th>
              <th className="px-4 py-3.5 font-semibold">Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const style = institutionTypeStyle[row.product.institutionType];
              const isTop = row.maturityAmount !== null && row.maturityAmount === topMaturity;
              return (
                <tr key={row.product.id} className={`border-t border-border ${isTop ? "bg-accent/10" : ""}`}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      {isTop && <Crown className="h-4 w-4 text-accent shrink-0" strokeWidth={2.25} />}
                      <div>
                        <div className="font-semibold">{row.product.institutionName}</div>
                        <span
                          className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${style.badge}`}
                        >
                          {institutionTypeLabels[row.product.institutionType]}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium">{row.product.name}</div>
                    <div className="text-xs text-muted">{productTypeLabels[row.product.productType]}</div>
                  </td>
                  {row.tier ? (
                    <>
                      <td className="px-4 py-3.5 text-right tabular-nums font-medium">
                        {row.tier.interestRatePct.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums font-display font-bold text-base">
                        {bdt.format(row.maturityAmount ?? 0)}
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-emerald-600 dark:text-emerald-400 font-medium">
                        +{bdt.format(row.totalInterest ?? 0)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted">
                        {row.tier.source === "SCRAPED" ? "Scraped" : "Manual"}
                        {row.tier.sourceUrl && (
                          <a
                            href={row.tier.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 ml-1.5 underline decoration-dotted hover:text-foreground"
                          >
                            source <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </td>
                    </>
                  ) : (
                    <td colSpan={4} className="px-4 py-3.5 text-muted italic">
                      Not offered at this amount/tenure
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "brand-gradient text-white shadow-sm"
          : "bg-foreground/5 text-muted hover:bg-foreground/10 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function isRecurringProductType(filter: ProductType | "ALL") {
  if (filter === "ALL") return false;
  return isRecurringProduct(filter);
}

function RecommendationCard({
  icon: Icon,
  label,
  row,
  reasoning,
}: {
  icon: LucideIcon;
  label: string;
  row: Row | null;
  reasoning: string;
}) {
  if (!row || !row.tier) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted">
        <div className="flex items-center gap-2 font-medium text-foreground/70">
          <Icon className="h-4 w-4" />
          {label}
        </div>
        <p className="mt-2">No matching option at this amount/tenure.</p>
      </div>
    );
  }

  const style = institutionTypeStyle[row.product.institutionType];

  return (
    <div className="rounded-2xl card-surface p-4 shadow-sm space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted">
        <Icon className="h-4 w-4 text-accent" />
        {label}
      </div>
      <div>
        <p className="font-display font-bold leading-snug">{row.product.institutionName}</p>
        <p className="text-xs text-muted">{row.product.name}</p>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-xl font-bold tabular-nums">
          {row.tier.interestRatePct.toFixed(2)}%
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${style.badge}`}>
          {institutionTypeLabels[row.product.institutionType]}
        </span>
      </div>
      <p className="text-sm tabular-nums font-semibold">{bdt.format(row.maturityAmount ?? 0)}</p>
      <p className="text-xs text-muted leading-relaxed">{reasoning}</p>
    </div>
  );
}
