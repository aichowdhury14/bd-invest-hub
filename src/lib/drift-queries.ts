import { prisma } from "@/lib/prisma";

export async function getPendingDriftCount(): Promise<number> {
  return prisma.rateDriftFlag.count({ where: { status: "PENDING" } });
}

export async function getPendingDriftFlags() {
  return prisma.rateDriftFlag.findMany({
    where: { status: "PENDING" },
    orderBy: { detectedAt: "desc" },
    include: {
      product: {
        select: { name: true, productType: true, institution: { select: { name: true } } },
      },
    },
  });
}
