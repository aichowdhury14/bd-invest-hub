"use client";

import { useMemo, useState } from "react";
import { BarChart3, Search, Sparkles, X } from "lucide-react";
import type { SerializedProduct } from "@/lib/serialize";
import { institutionTypeLabels, isRecurringProduct, productTypeLabels } from "@/lib/labels";
import { institutionTypeStyle } from "@/lib/institution-style";
import { InstitutionLogo } from "@/components/InstitutionLogo";
import { calculateDPSMaturity, calculateLumpSumMaturity } from "@/lib/calculations";
import type { InstitutionType, ProductType } from "@prisma/client";
import { useAmountInput } from "@/lib/useAmountInput";
import { useSessionId } from "@/lib/useSessionId";
import { trackCompareView } from "@/lib/analytics";
import { ComparisonChart, type ComparisonBar } from "./ComparisonChart";

const MAX_SELECTED = 6;

function formatTenure(months: number): string {
  if (months % 12 === 0) {
    const years = months / 12;
    return `${months} mo (${years} year${years > 1 ? "s" : ""})`;
  }
  return `${months} mo`;
}

const INSTITUTION_TYPES: InstitutionType[] = ["BANK", "GOVERNMENT", "INVESTMENT_ORG"];

export function CompareClient({ products }: { products: SerializedProduct[] }) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [instFilter, setInstFilter] = useState<InstitutionType | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<ProductType | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<"rate" | "name">("rate");
  const sessionId = useSessionId();

  const tenureOptions = useMemo(() => {
    const set = new Set<number>();
    for (const product of products) for (const tier of product.rateTiers) set.add(tier.tenureMonths);
    return Array.from(set).sort((a, b) => a - b);
  }, [products]);

  const { amount, raw: amountRaw, onChange: onAmountChange } = useAmountInput(100000);
  const [tenureIndex, setTenureIndex] = useState(() => {
    const idx = tenureOptions.indexOf(12);
    return idx >= 0 ? idx : 0;
  });
  // Clamp rather than store an effect-driven correction — tenureOptions is
  // derived from static props, so this only ever matters defensively.
  const clampedTenureIndex = Math.min(tenureIndex, Math.max(0, tenureOptions.length - 1));
  const tenureMonths = tenureOptions[clampedTenureIndex] ?? 0;

  /** Rate at the exact selected amount/tenure only — null (not a fallback) when not offered, so sorting/selection never treats an unavailable product as a good pick. */
  const rateAt = (product: SerializedProduct): number | null => {
    const tier = product.rateTiers.find(
      (t) => t.tenureMonths === tenureMonths && amount >= t.minAmount && (t.maxAmount === null || amount <= t.maxAmount)
    );
    return tier ? tier.interestRatePct : null;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter(
      (p) =>
        (instFilter === "ALL" || p.institutionType === instFilter) &&
        (typeFilter === "ALL" || p.productType === typeFilter) &&
        (q === "" ||
          p.institutionName.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          productTypeLabels[p.productType].toLowerCase().includes(q))
    );
    list = [...list].sort((a, b) => {
      if (sortBy === "name") return a.institutionName.localeCompare(b.institutionName);
      // Available-at-this-tenure products always sort above unavailable ones,
      // so "sort by rate" and "compare top N" never surface a product that
      // would immediately show "not offered."
      const ra = rateAt(a);
      const rb = rateAt(b);
      if (ra === null && rb === null) return a.institutionName.localeCompare(b.institutionName);
      if (ra === null) return 1;
      if (rb === null) return -1;
      return rb - ra;
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, query, instFilter, typeFilter, sortBy, tenureMonths, amount]);

  const selected = products.filter((p) => selectedIds.includes(p.id));

  function toggle(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SELECTED) return prev;
      if (sessionId) trackCompareView(id, sessionId);
      return [...prev, id];
    });
  }

  function selectTopN(n: number) {
    const ids = filtered
      .filter((p) => rateAt(p) !== null)
      .slice(0, n)
      .map((p) => p.id);
    if (sessionId) {
      for (const id of ids) {
        if (!selectedIds.includes(id)) trackCompareView(id, sessionId);
      }
    }
    setSelectedIds(ids);
  }

  const comparisonBars: ComparisonBar[] = useMemo(
    () =>
      selected.map((product) => {
        const tier = product.rateTiers.find(
          (t) => t.tenureMonths === tenureMonths && amount >= t.minAmount && (t.maxAmount === null || amount <= t.maxAmount)
        );
        if (!tier || amount <= 0) {
          return { id: product.id, label: product.institutionName, sub: product.name, maturityAmount: null, institutionType: product.institutionType };
        }
        const result = isRecurringProduct(product.productType)
          ? calculateDPSMaturity({ monthlyDeposit: amount, annualRatePct: tier.interestRatePct, tenureMonths, compounding: product.compounding })
          : calculateLumpSumMaturity({ principal: amount, annualRatePct: tier.interestRatePct, tenureMonths, compounding: product.compounding });
        return {
          id: product.id,
          label: product.institutionName,
          sub: `${product.name} · ${tier.interestRatePct.toFixed(2)}%`,
          maturityAmount: result.maturityAmount,
          institutionType: product.institutionType,
        };
      }),
    [selected, amount, tenureMonths]
  );

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
        No rate data has been added yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl card-surface p-5 sm:p-7 shadow-sm grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="cmp-amount" className="text-sm font-semibold">
            Amount (BDT — monthly deposit for DPS)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted font-display font-semibold">
              ৳
            </span>
            <input
              id="cmp-amount"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={amountRaw}
              onChange={(e) => onAmountChange(e.target.value)}
              className="w-full rounded-xl border border-border bg-transparent pl-8 pr-3 py-2.5 text-lg font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-end"
            />
          </div>
        </div>

        {tenureOptions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="cmp-tenure" className="font-semibold">
                Tenure
              </label>
              <span className="tabular-nums rounded-full bg-foreground/5 px-2.5 py-0.5 text-xs font-semibold">
                {formatTenure(tenureMonths)}
              </span>
            </div>
            <input
              id="cmp-tenure"
              type="range"
              min={0}
              max={Math.max(0, tenureOptions.length - 1)}
              step={1}
              value={clampedTenureIndex}
              onChange={(e) => setTenureIndex(Number(e.target.value))}
              className="w-full accent-current h-2 mt-3.5"
              style={{ color: "var(--brand-end)" }}
            />
            <div className="flex justify-between text-xs text-muted">
              <span>{formatTenure(tenureOptions[0])}</span>
              <span>{formatTenure(tenureOptions[tenureOptions.length - 1])}</span>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl card-surface p-4 sm:p-5 shadow-sm space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search institution or product…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-transparent pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-end"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterChip active={instFilter === "ALL"} onClick={() => setInstFilter("ALL")}>
            All institutions
          </FilterChip>
          {INSTITUTION_TYPES.map((t) => (
            <FilterChip key={t} active={instFilter === t} onClick={() => setInstFilter(t)}>
              {institutionTypeLabels[t]}
            </FilterChip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterChip active={typeFilter === "ALL"} onClick={() => setTypeFilter("ALL")}>
            All products
          </FilterChip>
          {Array.from(new Set(products.map((p) => p.productType))).map((t) => (
            <FilterChip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>
              {productTypeLabels[t]}
            </FilterChip>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted">Sort:</span>
            <FilterChip active={sortBy === "rate"} onClick={() => setSortBy("rate")} small>
              Best rate at this tenure
            </FilterChip>
            <FilterChip active={sortBy === "name"} onClick={() => setSortBy("name")} small>
              Name
            </FilterChip>
          </div>
          <button
            type="button"
            onClick={() => selectTopN(3)}
            className="inline-flex items-center gap-1.5 rounded-full brand-gradient px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Compare top 3 now
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-80 overflow-y-auto rounded-xl">
          {filtered.map((product) => {
            const checked = selectedIds.includes(product.id);
            const disabled = !checked && selectedIds.length >= MAX_SELECTED;
            const style = institutionTypeStyle[product.institutionType];
            const rate = rateAt(product);
            return (
              <label
                key={product.id}
                className={`flex items-start gap-2.5 rounded-xl p-2.5 text-sm transition-colors ${
                  checked ? "bg-brand-end/10" : disabled ? "opacity-40" : "hover:bg-foreground/5 cursor-pointer"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(product.id)}
                  className="mt-1 accent-current shrink-0"
                  style={{ color: "var(--brand-end)" }}
                />
                <InstitutionLogo name={product.institutionName} type={product.institutionType} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="min-w-0 flex-1 truncate font-semibold">{product.institutionName}</span>
                    <span
                      className={`shrink-0 text-xs font-semibold tabular-nums ${rate === null ? "text-muted/60 italic font-normal" : "text-muted"}`}
                    >
                      {rate === null ? "not offered" : `${rate.toFixed(2)}%`}
                    </span>
                  </span>
                  <span className="block text-xs text-muted truncate">{product.name}</span>
                  <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${style.badge}`}>
                    {productTypeLabels[product.productType]}
                  </span>
                </span>
              </label>
            );
          })}
          {filtered.length === 0 && (
            <p className="col-span-full py-6 text-center text-sm text-muted">
              No products match these filters.
            </p>
          )}
        </div>
      </div>

      {selected.length > 0 && (
        <>
          <div className="rounded-2xl card-surface p-4 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-accent" />
              <h2 className="font-display font-bold">
                Maturity amount at {formatTenure(tenureMonths)}
              </h2>
            </div>
            <ComparisonChart bars={comparisonBars} />
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(240px, 1fr))` }}>
            {selected.map((product) => {
              const style = institutionTypeStyle[product.institutionType];
              return (
                <div key={product.id} className="rounded-2xl card-surface p-5 space-y-3 shadow-sm relative">
                  <button
                    onClick={() => toggle(product.id)}
                    aria-label="Remove from comparison"
                    className="absolute top-3 right-3 grid h-7 w-7 place-items-center rounded-full text-muted hover:text-foreground hover:bg-foreground/5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <div className="pr-6 flex items-start gap-2.5">
                    <InstitutionLogo name={product.institutionName} type={product.institutionType} size="md" />
                    <div className="min-w-0">
                      <h3 className="font-display font-semibold leading-snug">{product.institutionName}</h3>
                      <p className="text-xs text-muted mt-0.5">{product.name}</p>
                      <span className={`inline-block mt-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${style.badge}`}>
                        {institutionTypeLabels[product.institutionType]} · {productTypeLabels[product.productType]}
                      </span>
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted">
                        <th className="pb-1.5 font-medium">Tenure</th>
                        <th className="pb-1.5 font-medium text-right">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.rateTiers.map((tier) => {
                        const isActive =
                          tier.tenureMonths === tenureMonths &&
                          amount >= tier.minAmount &&
                          (tier.maxAmount === null || amount <= tier.maxAmount);
                        return (
                          <tr
                            key={tier.id}
                            className={`border-t border-border ${isActive ? "bg-accent/10" : ""}`}
                          >
                            <td className="py-2">{tier.tenureMonths} mo</td>
                            <td className="py-2 text-right tabular-nums font-semibold">
                              {tier.interestRatePct.toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  small = false,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full font-medium transition-colors ${small ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm"} ${
        active
          ? "brand-gradient text-white shadow-sm"
          : "bg-foreground/5 text-muted hover:bg-foreground/10 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
