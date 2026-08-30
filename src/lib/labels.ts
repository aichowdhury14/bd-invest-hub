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
