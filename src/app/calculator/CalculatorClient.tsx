"use client";

import { useEffect, useMemo, useState } from "react";
import { Crown, ExternalLink } from "lucide-react";
import type { SerializedProduct } from "@/lib/serialize";
import { calculateDPSMaturity, calculateLumpSumMaturity } from "@/lib/calculations";
import { institutionTypeLabels, isRecurringProduct, productTypeLabels } from "@/lib/labels";
import { institutionTypeStyle } from "@/lib/institution-style";
import { useSessionId } from "@/lib/useSessionId";
import { trackCalculatorUse } from "@/lib/analytics";
import type { ProductType } from "@prisma/client";

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
      </div>

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
