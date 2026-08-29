"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Sparkles, Target, type LucideIcon } from "lucide-react";
import type { ProductType } from "@prisma/client";
import type { SerializedProduct } from "@/lib/serialize";
import { institutionTypeLabels, productTypeLabels } from "@/lib/labels";
import { institutionTypeStyle } from "@/lib/institution-style";
import { InstitutionLogo } from "@/components/InstitutionLogo";
import { buildGoalRecommendations, type GoalRow } from "@/lib/goal";
import { useAmountInput } from "@/lib/useAmountInput";

const bdt = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const YEAR_OPTIONS = [1, 2, 3, 5, 7, 10, 15, 20, 25];

function formatTenure(months: number): string {
  if (months % 12 === 0) {
    const years = months / 12;
    return `${months} mo (${years} year${years > 1 ? "s" : ""})`;
  }
  return `${months} mo`;
}

export function GoalCalculator({ products }: { products: SerializedProduct[] }) {
  const tenureOptions = useMemo(() => {
    const set = new Set<number>();
    for (const product of products) for (const tier of product.rateTiers) set.add(tier.tenureMonths);
    return Array.from(set).sort((a, b) => a - b);
  }, [products]);

  const yearOptions = useMemo(() => {
    // Only offer year marks that land on a tenure at least one product tracks,
    // so the slider never lands on a dead zone with zero results.
    const available = YEAR_OPTIONS.filter((y) => tenureOptions.includes(y * 12));
    return available.length > 0 ? available : YEAR_OPTIONS;
  }, [tenureOptions]);

  const productTypes = useMemo(() => {
    const set = new Set<ProductType>();
    for (const product of products) set.add(product.productType);
    return Array.from(set);
  }, [products]);

  const { amount: targetAmount, raw: targetRaw, onChange: onTargetChange } = useAmountInput(1000000);
  const [yearIndex, setYearIndex] = useState(() => {
    const defaultIdx = yearOptions.indexOf(5);
    return defaultIdx >= 0 ? defaultIdx : 0;
  });
  const [typeFilter, setTypeFilter] = useState<ProductType | "ALL">("ALL");

  const years = yearOptions[yearIndex] ?? yearOptions[0] ?? 1;
  const tenureMonths = years * 12;

  const { lumpSumRows, dpsRows, recommendations } = useMemo(
    () => buildGoalRecommendations(products, { targetAmount, tenureMonths, typeFilter }),
    [products, targetAmount, tenureMonths, typeFilter]
  );

  const hasAnyResult = recommendations.some((r) => r.row);

  if (tenureOptions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
        No rate data has been added yet, so there is nothing to calculate.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl card-surface p-5 sm:p-7 shadow-sm grid gap-7 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="goal-amount" className="text-sm font-semibold">
            Target amount (BDT, by maturity)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted font-display font-semibold">
              ৳
            </span>
            <input
              id="goal-amount"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={targetRaw}
              onChange={(e) => onTargetChange(e.target.value)}
              className="w-full rounded-xl border border-border bg-transparent pl-8 pr-3 py-2.5 text-lg font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-end"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="goal-years" className="font-semibold">
              Time to reach it
            </label>
            <span className="tabular-nums rounded-full bg-foreground/5 px-2.5 py-0.5 text-xs font-semibold">
              {years} year{years > 1 ? "s" : ""}
            </span>
          </div>
          <input
            id="goal-years"
            type="range"
            min={0}
            max={yearOptions.length - 1}
            step={1}
            value={yearIndex}
            onChange={(e) => setYearIndex(Number(e.target.value))}
            className="w-full accent-current h-2 mt-3.5"
            style={{ color: "var(--brand-end)" }}
          />
          <div className="flex justify-between text-xs text-muted">
            <span>{yearOptions[0]} year{yearOptions[0] > 1 ? "s" : ""}</span>
            <span>{yearOptions[yearOptions.length - 1]} years</span>
          </div>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-semibold">Product type</label>
          <div className="flex flex-wrap gap-2">
            <GoalFilterChip active={typeFilter === "ALL"} onClick={() => setTypeFilter("ALL")}>
              All types
            </GoalFilterChip>
            {productTypes.map((type) => (
              <GoalFilterChip key={type} active={typeFilter === type} onClick={() => setTypeFilter(type)}>
                {productTypeLabels[type]}
              </GoalFilterChip>
            ))}
          </div>
        </div>
      </div>

      {hasAnyResult ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h2 className="font-display font-bold">What you&apos;d need to deposit</h2>
            <span className="text-xs text-muted">
              — solved from today&apos;s live rates for {bdt.format(targetAmount)} in {years} year
              {years > 1 ? "s" : ""}, not a prediction
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {recommendations.map((rec) => (
              <GoalRecommendationCard
                key={rec.key}
                icon={rec.icon}
                label={rec.label}
                row={rec.row}
                reasoning={rec.reasoning}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
          No tracked product offers a {formatTenure(tenureMonths)} tenure. Try a different number of
          years.
        </div>
      )}

      {lumpSumRows.length > 0 && (
        <GoalTable title="One-time deposit options" rows={lumpSumRows} depositLabel="Deposit needed" />
      )}
      {dpsRows.length > 0 && (
        <GoalTable title="Monthly deposit options" rows={dpsRows} depositLabel="Monthly deposit needed" />
      )}
    </div>
  );
}

function GoalFilterChip({
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
      className={`btn-press rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "brand-gradient text-white shadow-sm hover:shadow-md"
          : "bg-foreground/5 text-muted hover:bg-foreground/10 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function GoalRecommendationCard({
  icon: Icon,
  label,
  row,
  reasoning,
}: {
  icon: LucideIcon;
  label: string;
  row: GoalRow | null;
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
    <div className="group relative overflow-hidden rounded-2xl card-surface p-4 shadow-sm card-interactive space-y-2">
      <span className={`absolute inset-x-0 top-0 h-1 ${style.iconWrap} opacity-70`} aria-hidden />
      <div className="flex items-center gap-2 text-sm font-medium text-muted">
        <span className={`grid h-6 w-6 place-items-center rounded-md ${style.iconWrap}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        {label}
      </div>
      <div className="flex items-center gap-2.5">
        <InstitutionLogo name={row.product.institutionName} type={row.product.institutionType} size="sm" />
        <div className="min-w-0">
          <p className="font-display font-bold leading-snug">{row.product.institutionName}</p>
          <p className="text-xs text-muted">{row.product.name}</p>
        </div>
      </div>
      <p className="text-2xl font-display font-bold tabular-nums">{bdt.format(row.requiredDeposit ?? 0)}</p>
      <div className="flex items-center gap-2">
        <span className="font-display text-sm font-semibold tabular-nums text-muted">
          {row.tier.interestRatePct.toFixed(2)}%
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${style.badge}`}>
          {institutionTypeLabels[row.product.institutionType]}
        </span>
      </div>
      <p className="text-xs text-muted leading-relaxed">{reasoning}</p>
    </div>
  );
}

function GoalTable({
  title,
  rows,
  depositLabel,
}: {
  title: string;
  rows: GoalRow[];
  depositLabel: string;
}) {
  return (
    <div className="space-y-2">
      <h3 className="font-display font-semibold text-sm text-muted flex items-center gap-1.5">
        <Target className="h-3.5 w-3.5" />
        {title}
      </h3>
      <div className="overflow-x-auto rounded-2xl card-surface shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-foreground/[0.03] text-left">
            <tr>
              <th className="px-4 py-3.5 font-semibold">Institution</th>
              <th className="px-4 py-3.5 font-semibold">Product</th>
              <th className="px-4 py-3.5 font-semibold text-right">Rate</th>
              <th className="px-4 py-3.5 font-semibold text-right">{depositLabel}</th>
              <th className="px-4 py-3.5 font-semibold">Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const style = institutionTypeStyle[row.product.institutionType];
              return (
                <tr key={row.product.id} className="border-t border-border row-interactive">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <InstitutionLogo name={row.product.institutionName} type={row.product.institutionType} size="sm" />
                      <div>
                        <div className="font-semibold">{row.product.institutionName}</div>
                        <span className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${style.badge}`}>
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
                        {bdt.format(row.requiredDeposit ?? 0)}
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
                    <td colSpan={3} className="px-4 py-3.5 text-muted italic">
                      Not offered at this tenure
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
