import type { InstitutionType, ProductType } from "@prisma/client";

export const institutionTypeLabels: Record<InstitutionType, string> = {
  BANK: "Bank",
  GOVERNMENT: "Government",
  INVESTMENT_ORG: "Investment Organization",
  DIGITAL_BANK: "Digital Bank",
};

export const productTypeLabels: Record<ProductType, string> = {
  FDR: "Fixed Deposit (FDR)",
  DPS: "Deposit Pension Scheme (DPS)",
  SANCHAYPATRO: "Sanchaypatro",
  TBOND: "Treasury Bond",
  TBILL: "Treasury Bill",
  OTHER: "Other",
};

/** DPS is a recurring-deposit product; every other type is a lump-sum deposit. */
export function isRecurringProduct(productType: ProductType): boolean {
  return productType === "DPS";
}

export type BankingMode = "ALL" | "CONVENTIONAL" | "ISLAMIC";

export const bankingModeLabels: Record<BankingMode, string> = {
  ALL: "All banking",
  CONVENTIONAL: "Conventional Banking",
  ISLAMIC: "Islamic Banking",
};

/**
 * Islamic (Mudaraba/Shariah) products pay profit-sharing, not guaranteed
 * interest — same underlying number and math, different real-world meaning,
 * so every UI surface showing a rate must use the right word for it.
 */
export function rateLabel(isIslamic: boolean): string {
  return isIslamic ? "Profit rate" : "Interest rate";
}

/**
 * Shown where a product has neither a percentage rate nor a profit-sharing
 * ratio — i.e. the bank genuinely publishes no figure we could verify.
 *
 * A bare em-dash reads as "missing data" (as if we forgot, or the page is
 * broken). These products are deliberately empty: this app never fills a
 * gap with an estimate, so the absence is itself the honest answer and
 * should say so. Overwhelmingly these are Islamic-banking windows whose
 * banks disclose nothing publicly — see research/rate-research-2026-08-28.md
 * for the per-bank findings behind each one.
 */
export const NOT_PUBLISHED_LABEL = "Not published";

export function notPublishedTooltip(isIslamic: boolean): string {
  const kind = isIslamic ? "profit rate or sharing ratio" : "rate";
  return `This bank does not publish a ${kind} for this product. We show nothing rather than an estimate.`;
}
