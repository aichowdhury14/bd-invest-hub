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
    isIslamic: false,
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
    profitSharingRatios: [],
  },
  {
    id: "govt-a-sanchaypatro",
    institutionId: "govt-a",
    institutionName: "Test Sanchaypatro",
    institutionType: "GOVERNMENT",
    productType: "SANCHAYPATRO",
    name: "5-Year Sanchaypatro",
    compounding: "QUARTERLY",
    isIslamic: false,
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
    profitSharingRatios: [],
  },
  {
    id: "nbfi-a-fdr",
    institutionId: "nbfi-a",
    institutionName: "Test NBFI A",
    institutionType: "INVESTMENT_ORG",
    productType: "FDR",
    name: "Term Deposit",
    compounding: "QUARTERLY",
    isIslamic: false,
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
    profitSharingRatios: [],
  },
  {
    id: "bank-a-islamic-fdr",
    institutionId: "bank-a",
    institutionName: "Test Bank A",
    institutionType: "BANK",
    productType: "FDR",
    name: "Mudaraba Term Deposit",
    compounding: "QUARTERLY",
    isIslamic: true,
    rateTiers: [
      {
        id: "t4",
        tenureMonths: 12,
        minAmount: 0,
        maxAmount: null,
        interestRatePct: 9,
        source: "MANUAL",
        sourceUrl: null,
        scrapedAt: null,
        effectiveFrom: new Date().toISOString(),
      },
    ],
    profitSharingRatios: [],
  },
];

describe("buildRecommendations", () => {
  it("bankingMode ISLAMIC returns only isIslamic products", () => {
    const { rows } = buildRecommendations(products, {
      amount: 100000,
      tenureMonths: 12,
      typeFilter: "ALL",
      riskProfile: "BALANCED",
      bankingMode: "ISLAMIC",
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].product.id).toBe("bank-a-islamic-fdr");
  });

  it("bankingMode CONVENTIONAL excludes isIslamic products", () => {
    const { rows } = buildRecommendations(products, {
      amount: 100000,
      tenureMonths: 12,
      typeFilter: "ALL",
      riskProfile: "BALANCED",
      bankingMode: "CONVENTIONAL",
    });
    expect(rows.every((r) => !r.product.isIslamic)).toBe(true);
    expect(rows.map((r) => r.product.id)).not.toContain("bank-a-islamic-fdr");
  });

  it("bankingMode defaults to ALL when omitted", () => {
    const { rows } = buildRecommendations(products, {
      amount: 100000,
      tenureMonths: 12,
      typeFilter: "ALL",
      riskProfile: "BALANCED",
    });
    expect(rows).toHaveLength(4);
  });

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
