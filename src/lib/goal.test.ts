import { describe, expect, it } from "vitest";
import { buildGoalRecommendations, solveForGoal } from "./goal";
import { calculateDPSMaturity, calculateLumpSumMaturity } from "./calculations";
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
      { id: "t1", tenureMonths: 12, minAmount: 0, maxAmount: null, interestRatePct: 8, source: "MANUAL", sourceUrl: null, scrapedAt: null, effectiveFrom: new Date().toISOString() },
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
      { id: "t2", tenureMonths: 12, minAmount: 0, maxAmount: null, interestRatePct: 11, source: "MANUAL", sourceUrl: null, scrapedAt: null, effectiveFrom: new Date().toISOString() },
    ],
    profitSharingRatios: [],
  },
  {
    id: "bank-a-dps",
    institutionId: "bank-a",
    institutionName: "Test Bank A",
    institutionType: "BANK",
    productType: "DPS",
    name: "Deposit Pension Scheme",
    compounding: "MONTHLY",
    isIslamic: false,
    rateTiers: [
      { id: "t3", tenureMonths: 12, minAmount: 0, maxAmount: null, interestRatePct: 9, source: "MANUAL", sourceUrl: null, scrapedAt: null, effectiveFrom: new Date().toISOString() },
    ],
    profitSharingRatios: [],
  },
  {
    id: "bank-a-islamic-dps",
    institutionId: "bank-a",
    institutionName: "Test Bank A",
    institutionType: "BANK",
    productType: "DPS",
    name: "Mudaraba DPS",
    compounding: "MONTHLY",
    isIslamic: true,
    rateTiers: [
      { id: "t4", tenureMonths: 12, minAmount: 0, maxAmount: null, interestRatePct: 8.5, source: "MANUAL", sourceUrl: null, scrapedAt: null, effectiveFrom: new Date().toISOString() },
    ],
    profitSharingRatios: [],
  },
];

describe("solveForGoal", () => {
  it("round-trips: depositing the solved lump sum reaches the target", () => {
    const result = solveForGoal({
      targetAmount: 500000,
      annualRatePct: 8,
      tenureMonths: 24,
      compounding: "QUARTERLY",
    });
    const check = calculateLumpSumMaturity({
      principal: result.requiredLumpSum,
      annualRatePct: 8,
      tenureMonths: 24,
      compounding: "QUARTERLY",
    });
    expect(check.maturityAmount).toBeCloseTo(500000, 0);
  });

  it("round-trips: depositing the solved monthly amount reaches the target via DPS", () => {
    const result = solveForGoal({
      targetAmount: 1000000,
      annualRatePct: 9,
      tenureMonths: 60,
      compounding: "MONTHLY",
    });
    const check = calculateDPSMaturity({
      monthlyDeposit: result.requiredMonthlyDeposit,
      annualRatePct: 9,
      tenureMonths: 60,
      compounding: "MONTHLY",
    });
    expect(check.maturityAmount).toBeCloseTo(1000000, 0);
  });

  it("requires a larger lump sum for a higher target, same rate/tenure", () => {
    const small = solveForGoal({ targetAmount: 100000, annualRatePct: 8, tenureMonths: 12, compounding: "SIMPLE" });
    const large = solveForGoal({ targetAmount: 200000, annualRatePct: 8, tenureMonths: 12, compounding: "SIMPLE" });
    expect(large.requiredLumpSum).toBeCloseTo(small.requiredLumpSum * 2, 0);
  });

  it("requires a smaller monthly deposit at a higher rate, same target/tenure", () => {
    const lowRate = solveForGoal({ targetAmount: 500000, annualRatePct: 5, tenureMonths: 36, compounding: "MONTHLY" });
    const highRate = solveForGoal({ targetAmount: 500000, annualRatePct: 10, tenureMonths: 36, compounding: "MONTHLY" });
    expect(highRate.requiredMonthlyDeposit).toBeLessThan(lowRate.requiredMonthlyDeposit);
  });

  it("rejects a non-positive target amount", () => {
    expect(() =>
      solveForGoal({ targetAmount: 0, annualRatePct: 5, tenureMonths: 12, compounding: "SIMPLE" })
    ).toThrow(RangeError);
  });
});

describe("buildGoalRecommendations", () => {
  it("bankingMode ISLAMIC returns only isIslamic products", () => {
    const { lumpSumRows, dpsRows } = buildGoalRecommendations(products, {
      targetAmount: 500000,
      tenureMonths: 12,
      typeFilter: "ALL",
      bankingMode: "ISLAMIC",
    });
    expect([...lumpSumRows, ...dpsRows].every((r) => r.product.isIslamic)).toBe(true);
    expect(dpsRows.map((r) => r.product.id)).toContain("bank-a-islamic-dps");
  });

  it("bankingMode CONVENTIONAL excludes isIslamic products", () => {
    const { lumpSumRows, dpsRows } = buildGoalRecommendations(products, {
      targetAmount: 500000,
      tenureMonths: 12,
      typeFilter: "ALL",
      bankingMode: "CONVENTIONAL",
    });
    expect([...lumpSumRows, ...dpsRows].every((r) => !r.product.isIslamic)).toBe(true);
  });

  it("never ranks a DPS monthly figure against a lump-sum figure", () => {
    const { lumpSumRows, dpsRows } = buildGoalRecommendations(products, {
      targetAmount: 500000,
      tenureMonths: 12,
      typeFilter: "ALL",
    });
    expect(lumpSumRows.every((r) => !["DPS"].includes(r.product.productType))).toBe(true);
    expect(dpsRows.every((r) => r.product.productType === "DPS")).toBe(true);
  });

  it("ranks lump-sum rows ascending by required deposit (lowest first)", () => {
    const { lumpSumRows } = buildGoalRecommendations(products, {
      targetAmount: 500000,
      tenureMonths: 12,
      typeFilter: "ALL",
    });
    for (let i = 1; i < lumpSumRows.length; i++) {
      expect(lumpSumRows[i].requiredDeposit ?? Infinity).toBeGreaterThanOrEqual(
        lumpSumRows[i - 1].requiredDeposit ?? Infinity
      );
    }
  });

  it("the government product needs the smallest lump sum (highest rate)", () => {
    const { picks } = buildGoalRecommendations(products, {
      targetAmount: 500000,
      tenureMonths: 12,
      typeFilter: "ALL",
    });
    expect(picks.cheapestLumpSum?.product.id).toBe("govt-a-sanchaypatro");
    // Only one bank offers a lump-sum product in this fixture set, so it's
    // necessarily also the cheapest-at-a-bank pick.
    expect(picks.cheapestLumpSumBank?.product.id).toBe("bank-a-fdr");
  });

  it("computes a monthly (not lump-sum) deposit for the DPS product", () => {
    const { dpsRows } = buildGoalRecommendations(products, {
      targetAmount: 500000,
      tenureMonths: 12,
      typeFilter: "DPS",
    });
    // A monthly deposit needed for a 12-month DPS to reach 500,000 should be
    // roughly target/12, not close to the full target (which a lump-sum
    // reading would produce).
    expect(dpsRows.every((r) => (r.requiredDeposit ?? 0) < 500000 / 6)).toBe(true);
  });

  it("returns null requiredDeposit for a tenure no product offers", () => {
    const { lumpSumRows, dpsRows, picks } = buildGoalRecommendations(products, {
      targetAmount: 500000,
      tenureMonths: 36,
      typeFilter: "ALL",
    });
    expect(lumpSumRows.every((r) => r.requiredDeposit === null)).toBe(true);
    expect(dpsRows.every((r) => r.requiredDeposit === null)).toBe(true);
    expect(picks.cheapestLumpSum).toBeNull();
    expect(picks.cheapestDPS).toBeNull();
  });
});
