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
