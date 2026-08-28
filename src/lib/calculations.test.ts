import { describe, expect, it } from "vitest";
import {
  calculateDPSMaturity,
  calculateLumpSumMaturity,
  dpsGrowthSeries,
  lumpSumGrowthSeries,
  requiredLumpSumPrincipal,
  requiredMonthlyDeposit,
} from "./calculations";

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

describe("lumpSumGrowthSeries", () => {
  const input = {
    principal: 100000,
    annualRatePct: 8,
    tenureMonths: 12,
    compounding: "QUARTERLY" as const,
  };

  it("starts at the principal and ends at the maturity amount", () => {
    const series = lumpSumGrowthSeries(input);
    const maturity = calculateLumpSumMaturity(input);
    expect(series[0]).toEqual({ month: 0, balance: 100000, contributed: 100000 });
    expect(series[series.length - 1].month).toBe(12);
    expect(series[series.length - 1].balance).toBeCloseTo(maturity.maturityAmount, 2);
  });

  it("is monotonically non-decreasing", () => {
    const series = lumpSumGrowthSeries(input);
    for (let i = 1; i < series.length; i++) {
      expect(series[i].balance).toBeGreaterThanOrEqual(series[i - 1].balance);
    }
  });

  it("caps the number of points for a long tenure", () => {
    const series = lumpSumGrowthSeries({ ...input, tenureMonths: 240 }, 24);
    expect(series.length).toBeLessThanOrEqual(26); // maxPoints + 1, plus the final mark
    expect(series[series.length - 1].month).toBe(240);
  });
});

describe("requiredLumpSumPrincipal", () => {
  it("inverts calculateLumpSumMaturity exactly (round trip)", () => {
    const input = {
      principal: 250000,
      annualRatePct: 8.5,
      tenureMonths: 18,
      compounding: "QUARTERLY" as const,
    };
    const { maturityAmount } = calculateLumpSumMaturity(input);
    const principal = requiredLumpSumPrincipal(
      maturityAmount,
      input.annualRatePct,
      input.tenureMonths,
      input.compounding
    );
    expect(principal).toBeCloseTo(input.principal, 1);
  });

  it("matches the textbook formula directly for simple interest", () => {
    // P = A / (1 + rt) = 108000 / (1 + 0.08*1) = 100000
    const principal = requiredLumpSumPrincipal(108000, 8, 12, "SIMPLE");
    expect(principal).toBeCloseTo(100000, 2);
  });

  it("rejects a non-positive tenure", () => {
    expect(() => requiredLumpSumPrincipal(100000, 5, 0, "YEARLY")).toThrow(RangeError);
  });
});

describe("requiredMonthlyDeposit", () => {
  it("inverts calculateDPSMaturity exactly (round trip)", () => {
    const input = {
      monthlyDeposit: 7500,
      annualRatePct: 6.5,
      tenureMonths: 36,
      compounding: "MONTHLY" as const,
    };
    const { maturityAmount } = calculateDPSMaturity(input);
    const deposit = requiredMonthlyDeposit(
      maturityAmount,
      input.annualRatePct,
      input.tenureMonths,
      input.compounding
    );
    expect(deposit).toBeCloseTo(input.monthlyDeposit, 1);
  });

  it("divides evenly at a zero rate", () => {
    const deposit = requiredMonthlyDeposit(60000, 0, 12, "MONTHLY");
    expect(deposit).toBeCloseTo(5000, 2);
  });

  it("rejects a non-positive tenure", () => {
    expect(() => requiredMonthlyDeposit(60000, 5, -3, "MONTHLY")).toThrow(RangeError);
  });
});

describe("dpsGrowthSeries", () => {
  const input = {
    monthlyDeposit: 5000,
    annualRatePct: 6,
    tenureMonths: 12,
    compounding: "MONTHLY" as const,
  };

  it("starts at zero and ends at the maturity amount", () => {
    const series = dpsGrowthSeries(input);
    const maturity = calculateDPSMaturity(input);
    expect(series[0]).toEqual({ month: 0, balance: 0, contributed: 0 });
    expect(series[series.length - 1].balance).toBeCloseTo(maturity.maturityAmount, 2);
    expect(series[series.length - 1].contributed).toBeCloseTo(maturity.totalDeposited, 2);
  });
});
