import { describe, expect, it } from "vitest";
import { buildRecommendations } from "./recommend";
import type { SerializedProduct } from "./serialize";

// Synthetic fixtures for unit testing only — not real published rates.
const products: SerializedProduct[] = [
  {
    id: "bank-a-fdr",
    institutionId: "bank-a",
    institutionName: "Test Bank A",
    institutionType: "BANK",
    productType: "FDR",
    name: "Fixed Deposit",
    compounding: "QUARTERLY",
    rateTiers: [
      {
        id: "t1",
        tenureMonths: 12,
        minAmount: 0,
        maxAmount: null,
        interestRatePct: 8,
        source: "MANUAL",
        sourceUrl: null,
        scrapedAt: null,
        effectiveFrom: new Date().toISOString(),
      },
    ],
  },
  {
    id: "govt-a-sanchaypatro",
    institutionId: "govt-a",
    institutionName: "Test Sanchaypatro",
    institutionType: "GOVERNMENT",
    productType: "SANCHAYPATRO",
    name: "5-Year Sanchaypatro",
    compounding: "QUARTERLY",
    rateTiers: [
      {
        id: "t2",
        tenureMonths: 12,
        minAmount: 0,
        maxAmount: null,
        interestRatePct: 11,
        source: "MANUAL",
        sourceUrl: null,
        scrapedAt: null,
        effectiveFrom: new Date().toISOString(),
      },
    ],
  },
  {
    id: "nbfi-a-fdr",
    institutionId: "nbfi-a",
    institutionName: "Test NBFI A",
    institutionType: "INVESTMENT_ORG",
    productType: "FDR",
    name: "Term Deposit",
    compounding: "QUARTERLY",
    rateTiers: [
      {
        id: "t3",
        tenureMonths: 12,
        minAmount: 0,
        maxAmount: null,
        interestRatePct: 12,
        source: "MANUAL",
        sourceUrl: null,
        scrapedAt: null,
        effectiveFrom: new Date().toISOString(),
      },
    ],
  },
];

describe("buildRecommendations", () => {
  it("ranks rows by maturity amount, highest first", () => {
    const { rows } = buildRecommendations(products, {
      amount: 100000,
      tenureMonths: 12,
      typeFilter: "ALL",
      riskProfile: "BALANCED",
    });
    expect(rows[0].product.id).toBe("nbfi-a-fdr"); // highest rate (12%)
    expect(rows[rows.length - 1].maturityAmount).toBeLessThanOrEqual(rows[0].maturityAmount ?? 0);
  });

  it("picks the highest-rate government product as safest", () => {
    const { picks } = buildRecommendations(products, {
      amount: 100000,
      tenureMonths: 12,
      typeFilter: "ALL",
      riskProfile: "BALANCED",
    });
    expect(picks.safest?.product.id).toBe("govt-a-sanchaypatro");
  });

  it("conservative profile never recommends an NBFI in its top cards", () => {
    const { recommendations } = buildRecommendations(products, {
      amount: 100000,
      tenureMonths: 12,
      typeFilter: "ALL",
      riskProfile: "CONSERVATIVE",
    });
    const institutionTypes = recommendations
      .map((r) => r.row?.product.institutionType)
      .filter((t): t is "BANK" | "GOVERNMENT" | "INVESTMENT_ORG" => t !== undefined);
    expect(institutionTypes).not.toContain("INVESTMENT_ORG");
  });

  it("growth profile surfaces the NBFI pick", () => {
    const { recommendations } = buildRecommendations(products, {
      amount: 100000,
      tenureMonths: 12,
      typeFilter: "ALL",
      riskProfile: "GROWTH",
    });
    const nbfiCard = recommendations.find((r) => r.key === "nbfi");
    expect(nbfiCard?.row?.product.id).toBe("nbfi-a-fdr");
  });

  it("returns null tier/maturity for a tenure not offered by any product", () => {
    const { rows, picks } = buildRecommendations(products, {
      amount: 100000,
      tenureMonths: 36,
      typeFilter: "ALL",
      riskProfile: "BALANCED",
    });
    expect(rows.every((r) => r.tier === null)).toBe(true);
    expect(picks.bestOverall).toBeNull();
  });

  it("respects the type filter", () => {
    const { rows } = buildRecommendations(products, {
      amount: 100000,
      tenureMonths: 12,
      typeFilter: "SANCHAYPATRO",
      riskProfile: "BALANCED",
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].product.id).toBe("govt-a-sanchaypatro");
  });
});
