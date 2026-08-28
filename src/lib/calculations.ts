// Core financial math for the platform. Kept as pure functions (no I/O) so they
// are cheap to unit test and safe to run client-side for instant calculator feedback.

export type Compounding = "SIMPLE" | "MONTHLY" | "QUARTERLY" | "YEARLY";

const PERIODS_PER_YEAR: Record<Exclude<Compounding, "SIMPLE">, number> = {
  MONTHLY: 12,
  QUARTERLY: 4,
  YEARLY: 1,
};

export interface LumpSumInput {
  /** Principal deposited once, e.g. an FDR. */
  principal: number;
  /** Annual nominal interest rate, as a percentage (e.g. 8.5 for 8.5%). */
  annualRatePct: number;
  tenureMonths: number;
  compounding: Compounding;
}

export interface LumpSumResult {
  maturityAmount: number;
  totalInterest: number;
  principal: number;
}

/**
 * Lump-sum maturity value for products like FDR, Sanchaypatro, T-Bond held to maturity.
 * Simple interest: A = P(1 + rt)
 * Compound interest: A = P(1 + r/n)^(nt)
 */
export function calculateLumpSumMaturity(input: LumpSumInput): LumpSumResult {
  const { principal, annualRatePct, tenureMonths, compounding } = input;
  if (principal < 0 || annualRatePct < 0 || tenureMonths <= 0) {
    throw new RangeError("principal, annualRatePct must be >= 0 and tenureMonths > 0");
  }

  const r = annualRatePct / 100;
  const t = tenureMonths / 12;

  let maturityAmount: number;
  if (compounding === "SIMPLE") {
    maturityAmount = principal * (1 + r * t);
  } else {
    const n = PERIODS_PER_YEAR[compounding];
    maturityAmount = principal * Math.pow(1 + r / n, n * t);
  }

  return {
    maturityAmount: roundToPaisa(maturityAmount),
    totalInterest: roundToPaisa(maturityAmount - principal),
    principal,
  };
}

export interface DPSInput {
  /** Fixed amount deposited each month, e.g. a DPS installment. */
  monthlyDeposit: number;
  annualRatePct: number;
  tenureMonths: number;
  compounding: Compounding;
}

export interface DPSResult {
  maturityAmount: number;
  totalDeposited: number;
  totalInterest: number;
}

/**
 * Future value of a recurring monthly deposit (DPS-style product), using the
 * ordinary annuity formula with the deposit compounded at the product's stated
 * frequency. This is the standard textbook approximation; individual banks may
 * apply slightly different day-count/rounding conventions on their own DPS books,
 * so treat this as an estimate.
 */
export function calculateDPSMaturity(input: DPSInput): DPSResult {
  const { monthlyDeposit, annualRatePct, tenureMonths, compounding } = input;
  if (monthlyDeposit < 0 || annualRatePct < 0 || tenureMonths <= 0) {
    throw new RangeError("monthlyDeposit, annualRatePct must be >= 0 and tenureMonths > 0");
  }

  const totalDeposited = monthlyDeposit * tenureMonths;
  const r = annualRatePct / 100;

  let maturityAmount: number;
  if (r === 0) {
    maturityAmount = totalDeposited;
  } else if (compounding === "SIMPLE") {
    // Simple interest on each installment for its remaining tenure.
    let total = 0;
    for (let month = 1; month <= tenureMonths; month++) {
      const remainingMonths = tenureMonths - month + 1;
      total += monthlyDeposit * (1 + r * (remainingMonths / 12));
    }
    maturityAmount = total;
  } else {
    // Monthly deposits, compounded at the product's periodic rate, using a monthly
    // effective rate derived from the nominal annual rate.
    const n = PERIODS_PER_YEAR[compounding];
    const monthlyRate = Math.pow(1 + r / n, n / 12) - 1;
    maturityAmount =
      monthlyRate === 0
        ? totalDeposited
        : monthlyDeposit * ((Math.pow(1 + monthlyRate, tenureMonths) - 1) / monthlyRate);
  }

  return {
    maturityAmount: roundToPaisa(maturityAmount),
    totalDeposited: roundToPaisa(totalDeposited),
    totalInterest: roundToPaisa(maturityAmount - totalDeposited),
  };
}

/** Round to 2 decimal places (nearest paisa) to avoid floating-point noise in the UI. */
function roundToPaisa(value: number): number {
  return Math.round(value * 100) / 100;
}

export interface GrowthPoint {
  month: number;
  balance: number;
  contributed: number;
}

/**
 * Balance at a series of points between now and maturity, for a "growth over
 * time" chart. Reuses calculateLumpSumMaturity at each partial tenure, so it
 * inherits that function's tested correctness rather than duplicating the math.
 */
export function lumpSumGrowthSeries(
  input: LumpSumInput,
  maxPoints = 24
): GrowthPoint[] {
  const { principal, tenureMonths } = input;
  const months = monthMarks(tenureMonths, maxPoints);
  return months.map((month) => {
    if (month === 0) return { month, balance: principal, contributed: principal };
    const result = calculateLumpSumMaturity({ ...input, tenureMonths: month });
    return { month, balance: result.maturityAmount, contributed: principal };
  });
}

/** Same idea as lumpSumGrowthSeries, for a recurring DPS-style deposit. */
export function dpsGrowthSeries(input: DPSInput, maxPoints = 24): GrowthPoint[] {
  const { monthlyDeposit, tenureMonths } = input;
  const months = monthMarks(tenureMonths, maxPoints);
  return months.map((month) => {
    if (month === 0) return { month, balance: 0, contributed: 0 };
    const result = calculateDPSMaturity({ ...input, tenureMonths: month });
    return { month, balance: result.maturityAmount, contributed: monthlyDeposit * month };
  });
}

/** Evenly spaced integer month marks from 0 to tenureMonths, capped at maxPoints. */
function monthMarks(tenureMonths: number, maxPoints: number): number[] {
  if (tenureMonths <= maxPoints) {
    return Array.from({ length: tenureMonths + 1 }, (_, i) => i);
  }
  const step = tenureMonths / maxPoints;
  const marks = new Set<number>();
  for (let i = 0; i <= maxPoints; i++) {
    marks.add(Math.round(i * step));
  }
  marks.add(tenureMonths);
  return Array.from(marks).sort((a, b) => a - b);
}
