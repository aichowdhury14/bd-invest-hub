"use client";

import { useMemo, useState } from "react";
import type { SerializedProduct } from "@/lib/serialize";
import { institutionTypeLabels, productTypeLabels } from "@/lib/labels";

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
      <div className="rounded-lg border border-dashed border-black/20 dark:border-white/20 p-8 text-center text-black/60 dark:text-white/60">
        No rate data has been added yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <input
        type="text"
        placeholder="Search institution or product…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
      />

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-72 overflow-y-auto rounded-lg border border-black/10 dark:border-white/10 p-3">
        {filtered.map((product) => {
          const checked = selectedIds.includes(product.id);
          const disabled = !checked && selectedIds.length >= MAX_SELECTED;
          return (
            <label
              key={product.id}
              className={`flex items-start gap-2 rounded-md p-2 text-sm ${
                disabled ? "opacity-40" : "hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(product.id)}
                className="mt-1 accent-emerald-700"
              />
              <span>
                <span className="block font-medium">{product.institutionName}</span>
                <span className="block text-black/50 dark:text-white/50 text-xs">
                  {productTypeLabels[product.productType]}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selected.length}, minmax(220px, 1fr))` }}>
          {selected.map((product) => (
            <div key={product.id} className="rounded-lg border border-black/10 dark:border-white/10 p-4 space-y-3">
              <div>
                <h3 className="font-semibold">{product.institutionName}</h3>
                <p className="text-xs text-black/50 dark:text-white/50">
                  {institutionTypeLabels[product.institutionType]} ·{" "}
                  {productTypeLabels[product.productType]}
                </p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-black/50 dark:text-white/50">
                    <th className="pb-1 font-medium">Tenure</th>
                    <th className="pb-1 font-medium text-right">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {product.rateTiers.map((tier) => (
                    <tr key={tier.id} className="border-t border-black/10 dark:border-white/10">
                      <td className="py-1.5">{tier.tenureMonths} mo</td>
                      <td className="py-1.5 text-right tabular-nums">
                        {tier.interestRatePct.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
