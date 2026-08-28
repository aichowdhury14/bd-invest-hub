"use client";

import { useEffect, useMemo, useState } from "react";
import type { SerializedProduct } from "@/lib/serialize";
import { calculateDPSMaturity, calculateLumpSumMaturity } from "@/lib/calculations";
import { institutionTypeLabels, isRecurringProduct, productTypeLabels } from "@/lib/labels";
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

  useEffect(() => {
    if (!sessionId || amount <= 0 || tenureMonths <= 0) return;
    const handle = setTimeout(() => {
      trackCalculatorUse({ sessionId, amount, tenureMonths });
    }, 800);
    return () => clearTimeout(handle);
  }, [sessionId, amount, tenureMonths]);

  if (tenureOptions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-black/20 dark:border-white/20 p-8 text-center text-black/60 dark:text-white/60">
        No rate data has been added yet, so there is nothing to calculate. Check back once the
        admin has added institutions and rates.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 sm:p-6 grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium">
            {typeFilter === "ALL"
              ? "Amount (lump sum — treated as the monthly deposit for DPS rows)"
              : isRecurringProductType(typeFilter, products)
                ? "Amount (per month)"
                : "Amount (BDT)"}
          </label>
          <input
            id="amount"
            type="number"
            min={0}
            step={1000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 text-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="tenure" className="font-medium">
              Tenure
            </label>
            <span className="tabular-nums text-black/70 dark:text-white/70">
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
            className="w-full accent-emerald-700"
          />
          <div className="flex justify-between text-xs text-black/40 dark:text-white/40">
            <span>{formatTenure(tenureOptions[0])}</span>
            <span>{formatTenure(tenureOptions[tenureOptions.length - 1])}</span>
          </div>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="type" className="text-sm font-medium">
            Product type
          </label>
          <select
            id="type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ProductType | "ALL")}
            className="w-full sm:w-64 rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="ALL">All types</option>
            {productTypes.map((type) => (
              <option key={type} value={type}>
                {productTypeLabels[type]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-black/5 dark:bg-white/5 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Institution</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium text-right">Rate</th>
              <th className="px-4 py-3 font-medium text-right">Maturity amount</th>
              <th className="px-4 py-3 font-medium text-right">Interest earned</th>
              <th className="px-4 py-3 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.product.id}
                className="border-t border-black/10 dark:border-white/10"
              >
                <td className="px-4 py-3">
                  <div className="font-medium">{row.product.institutionName}</div>
                  <div className="text-xs text-black/50 dark:text-white/50">
                    {institutionTypeLabels[row.product.institutionType]}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {productTypeLabels[row.product.productType]}
                  {isRecurringProduct(row.product.productType) && (
                    <span className="block text-xs text-black/40 dark:text-white/40">
                      amount = monthly deposit
                    </span>
                  )}
                </td>
                {row.tier ? (
                  <>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {row.tier.interestRatePct.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">
                      {bdt.format(row.maturityAmount ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-emerald-700 dark:text-emerald-400">
                      {bdt.format(row.totalInterest ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-xs text-black/50 dark:text-white/50">
                      {row.tier.source === "SCRAPED" ? "Scraped" : "Manual"}
                      {row.tier.sourceUrl && (
                        <>
                          {" · "}
                          <a
                            href={row.tier.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-emerald-700 dark:hover:text-emerald-400"
                          >
                            source
                          </a>
                        </>
                      )}
                    </td>
                  </>
                ) : (
                  <td colSpan={4} className="px-4 py-3 text-black/40 dark:text-white/40 italic">
                    Not offered at this amount/tenure
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function isRecurringProductType(filter: ProductType | "ALL", products: SerializedProduct[]) {
  if (filter === "ALL") return false;
  return isRecurringProduct(filter);
}
