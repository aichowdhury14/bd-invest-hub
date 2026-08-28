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
