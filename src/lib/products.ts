import { prisma } from "@/lib/prisma";

/** All active institutions with their active products and rate tiers, for the public pages. */
export async function getActiveInstitutionsWithProducts() {
  return prisma.institution.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { productType: "asc" },
        include: {
          rateTiers: {
            orderBy: { tenureMonths: "asc" },
          },
          profitSharingRatios: {
            orderBy: { tenureMonths: "asc" },
          },
        },
      },
    },
  });
}

export type ActiveInstitutionsWithProducts = Awaited<
  ReturnType<typeof getActiveInstitutionsWithProducts>
>;

/** The best (highest) advertised rate across a product's tiers, for headline display. */
export function bestRateForProduct(rateTiers: { interestRatePct: unknown }[]): number | null {
  if (rateTiers.length === 0) return null;
  return Math.max(...rateTiers.map((tier) => Number(tier.interestRatePct)));
}

/**
 * The longest-tenure profit-sharing ratio for a product, for headline display when
 * no percentage rate exists. Never used in any maturity-amount calculation — a
 * ratio (e.g. 65:35) cannot be compounded the way a percentage rate can.
 */
export function headlineRatioForProduct<
  T extends { tenureMonths: number; customerRatio: number; bankRatio: number }
>(profitSharingRatios: T[]): T | null {
  if (profitSharingRatios.length === 0) return null;
  return profitSharingRatios.reduce((longest, r) =>
    r.tenureMonths > longest.tenureMonths ? r : longest
  );
}
