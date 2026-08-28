import { describe, expect, it } from "vitest";
import { calculateDPSMaturity, calculateLumpSumMaturity } from "./calculations";

describe("calculateLumpSumMaturity", () => {
  it("computes simple interest correctly", () => {
    // A = P(1 + rt) = 100000 * (1 + 0.08 * 1) = 108000
    const result = calculateLumpSumMaturity({
      principal: 100000,
      annualRatePct: 8,
      tenureMonths: 12,
      compounding: "SIMPLE",
    });
    expect(result.maturityAmount).toBeCloseTo(108000, 2);
    expect(result.totalInterest).toBeCloseTo(8000, 2);
  });

  it("computes quarterly compound interest correctly", () => {
    // A = 100000 * (1 + 0.08/4)^(4*1) = 100000 * 1.02^4 = 108243.216
    const result = calculateLumpSumMaturity({
      principal: 100000,
      annualRatePct: 8,
      tenureMonths: 12,
      compounding: "QUARTERLY",
    });
    expect(result.maturityAmount).toBeCloseTo(108243.22, 1);
  });

  it("computes monthly compound interest over a fractional-year tenure", () => {
    // A = 50000 * (1 + 0.09/12)^(12 * 0.5) for 6 months
    const expected = 50000 * Math.pow(1 + 0.09 / 12, 6);
    const result = calculateLumpSumMaturity({
      principal: 50000,
      annualRatePct: 9,
      tenureMonths: 6,
      compounding: "MONTHLY",
    });
    expect(result.maturityAmount).toBeCloseTo(expected, 2);
  });

  it("returns zero interest at a zero rate", () => {
    const result = calculateLumpSumMaturity({
      principal: 20000,
      annualRatePct: 0,
      tenureMonths: 24,
      compounding: "QUARTERLY",
    });
    expect(result.maturityAmount).toBeCloseTo(20000, 2);
    expect(result.totalInterest).toBeCloseTo(0, 2);
  });

  it("rejects a non-positive tenure", () => {
    expect(() =>
      calculateLumpSumMaturity({
        principal: 1000,
        annualRatePct: 5,
        tenureMonths: 0,
        compounding: "YEARLY",
      })
    ).toThrow(RangeError);
  });
});

describe("calculateDPSMaturity", () => {
  it("returns exactly the sum of deposits at a zero rate", () => {
    const result = calculateDPSMaturity({
      monthlyDeposit: 5000,
      annualRatePct: 0,
      tenureMonths: 12,
      compounding: "MONTHLY",
    });
    expect(result.maturityAmount).toBeCloseTo(60000, 2);
    expect(result.totalDeposited).toBeCloseTo(60000, 2);
    expect(result.totalInterest).toBeCloseTo(0, 2);
  });

  it("computes a monthly-compounded annuity future value", () => {
    // Ordinary annuity FV with monthly rate i = r/12: M * ((1+i)^n - 1) / i
    const monthlyDeposit = 5000;
    const annualRatePct = 6;
    const tenureMonths = 12;
    const i = annualRatePct / 100 / 12;
    const expected = monthlyDeposit * ((Math.pow(1 + i, tenureMonths) - 1) / i);

    const result = calculateDPSMaturity({
      monthlyDeposit,
      annualRatePct,
      tenureMonths,
      compounding: "MONTHLY",
    });
    expect(result.maturityAmount).toBeCloseTo(expected, 1);
    expect(result.totalDeposited).toBeCloseTo(60000, 2);
  });

  it("produces more interest under simple accrual than a zero rate", () => {
    const result = calculateDPSMaturity({
      monthlyDeposit: 2000,
      annualRatePct: 7,
      tenureMonths: 24,
      compounding: "SIMPLE",
    });
    expect(result.totalDeposited).toBeCloseTo(48000, 2);
    expect(result.maturityAmount).toBeGreaterThan(48000);
    expect(result.totalInterest).toBeGreaterThan(0);
  });

  it("rejects a non-positive tenure", () => {
    expect(() =>
      calculateDPSMaturity({
        monthlyDeposit: 1000,
        annualRatePct: 5,
        tenureMonths: -1,
        compounding: "MONTHLY",
      })
    ).toThrow(RangeError);
  });
});
