"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { SerializedProduct } from "@/lib/serialize";
import { institutionTypeLabels, productTypeLabels } from "@/lib/labels";
import { institutionTypeStyle } from "@/lib/institution-style";

const MAX_SELECTED = 4;

export function CompareClient({ products }: { products: SerializedProduct[] }) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.institutionName.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        productTypeLabels[p.productType].toLowerCase().includes(q)
    );
  }, [products, query]);

  const selected = products.filter((p) => selectedIds.includes(p.id));

  function toggle(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SELECTED) return prev;
      return [...prev, id];
    });
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
        No rate data has been added yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-80 overflow-y-auto rounded-2xl card-surface p-3 shadow-sm">
        {filtered.map((product) => {
          const checked = selectedIds.includes(product.id);
          const disabled = !checked && selectedIds.length >= MAX_SELECTED;
          const style = institutionTypeStyle[product.institutionType];
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
                className="mt-1 accent-current"
                style={{ color: "var(--brand-end)" }}
              />
              <span>
                <span className="block font-semibold">{product.institutionName}</span>
                <span className="block text-xs text-muted">{product.name}</span>
                <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${style.badge}`}>
                  {productTypeLabels[product.productType]}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(auto-fit, minmax(230px, 1fr))` }}
        >
          {selected.map((product) => {
            const style = institutionTypeStyle[product.institutionType];
            return (
              <div key={product.id} className="rounded-2xl card-surface p-5 space-y-3 shadow-sm relative">
                <button
                  onClick={() => toggle(product.id)}
                  aria-label="Remove from comparison"
                  className="absolute top-3 right-3 grid h-6 w-6 place-items-center rounded-full text-muted hover:text-foreground hover:bg-foreground/5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="pr-6">
                  <h3 className="font-display font-semibold leading-snug">{product.institutionName}</h3>
                  <p className="text-xs text-muted mt-0.5">{product.name}</p>
                  <span className={`inline-block mt-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${style.badge}`}>
                    {institutionTypeLabels[product.institutionType]} · {productTypeLabels[product.productType]}
                  </span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted">
                      <th className="pb-1.5 font-medium">Tenure</th>
                      <th className="pb-1.5 font-medium text-right">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.rateTiers.map((tier) => (
                      <tr key={tier.id} className="border-t border-border">
                        <td className="py-2">{tier.tenureMonths} mo</td>
                        <td className="py-2 text-right tabular-nums font-semibold">
                          {tier.interestRatePct.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
