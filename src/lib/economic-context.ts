/**
 * Real, sourced macroeconomic figures used for the calculator's "real return"
 * and "net of tax" insights. Update these periodically — do not let them go
 * stale indefinitely, and never replace a figure with a guess.
 */
export const CURRENT_INFLATION = {
  /** General point-to-point CPI inflation, most recently published figure. */
  ratePct: 8.32,
  period: "July 2026",
  source: "Bangladesh Bureau of Statistics (BBS), via bssnews.net",
  sourceUrl: "https://www.bssnews.net/business/413784",
};

/**
 * Advance Income Tax (AIT / source tax) on bank deposit interest income,
 * under Income Tax Ordinance/Act Section 53F, as administered by the NBR.
 * Rates can change with each Finance Act — verify before relying on this for
 * a real tax decision.
 */
export const AIT_RATES = {
  withTin: 10,
  withoutTin: 15,
  exempt: 0, // pension/gratuity/provident funds and similarly exempted accounts
  source: "National Board of Revenue (NBR), Income Tax Ordinance s.53F",
  sourceUrl: "https://www.newagebd.net/article/97779/nbr-asks-banks-to-properly-deduct-tax-on-interest-income",
};

export type TaxStatus = "TIN" | "NO_TIN" | "EXEMPT";

export function aitRateForStatus(status: TaxStatus): number {
  if (status === "TIN") return AIT_RATES.withTin;
  if (status === "NO_TIN") return AIT_RATES.withoutTin;
  return AIT_RATES.exempt;
}

/** Approximate real (inflation-adjusted) annual rate, Fisher-style: nominal - inflation. */
export function realRatePct(nominalRatePct: number): number {
  return nominalRatePct - CURRENT_INFLATION.ratePct;
}
