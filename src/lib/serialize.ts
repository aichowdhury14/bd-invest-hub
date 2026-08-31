import type { ActiveInstitutionsWithProducts } from "@/lib/products";

export interface SerializedRateTier {
  id: string;
  tenureMonths: number;
  minAmount: number;
  maxAmount: number | null;
  interestRatePct: number;
  source: "MANUAL" | "SCRAPED";
  sourceUrl: string | null;
  scrapedAt: string | null;
  effectiveFrom: string;
}

export interface SerializedProduct {
  id: string;
  institutionId: string;
  institutionName: string;
  institutionType: "BANK" | "GOVERNMENT" | "INVESTMENT_ORG" | "DIGITAL_BANK";
  productType: "FDR" | "DPS" | "SANCHAYPATRO" | "TBOND" | "TBILL" | "OTHER";
  name: string;
  compounding: "SIMPLE" | "MONTHLY" | "QUARTERLY" | "YEARLY";
  isIslamic: boolean;
  rateTiers: SerializedRateTier[];
}

/** Flatten institutions -> products into a plain, JSON-serializable array for client components. */
export function serializeProducts(
  institutions: ActiveInstitutionsWithProducts
): SerializedProduct[] {
  const result: SerializedProduct[] = [];
  for (const inst of institutions) {
    for (const product of inst.products) {
      result.push({
        id: product.id,
        institutionId: inst.id,
        institutionName: inst.name,
        institutionType: inst.type,
        productType: product.productType,
        name: product.name,
        compounding: product.compounding,
        isIslamic: product.isIslamic,
        rateTiers: product.rateTiers.map((tier) => ({
          id: tier.id,
          tenureMonths: tier.tenureMonths,
          minAmount: Number(tier.minAmount),
          maxAmount: tier.maxAmount !== null ? Number(tier.maxAmount) : null,
          interestRatePct: Number(tier.interestRatePct),
          source: tier.source,
          sourceUrl: tier.sourceUrl,
          scrapedAt: tier.scrapedAt ? tier.scrapedAt.toISOString() : null,
          effectiveFrom: tier.effectiveFrom.toISOString(),
        })),
      });
    }
  }
  return result;
}
