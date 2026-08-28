import { prisma } from "@/lib/prisma";
import type { InstitutionType } from "@prisma/client";

const TYPES: InstitutionType[] = ["BANK", "GOVERNMENT", "INVESTMENT_ORG"];

export interface YieldCurvePoint {
  tenureMonths: number;
  BANK: number | null;
  GOVERNMENT: number | null;
  INVESTMENT_ORG: number | null;
}

/**
 * For a given product type (FDR or DPS), the best rate offered at each tenure,
 * grouped by institution type — a "yield curve" per category. Only tenures with
 * at least one real rate tier appear; missing cells stay null (never interpolated).
 */
export async function getYieldCurve(productType: "FDR" | "DPS"): Promise<YieldCurvePoint[]> {
  const tiers = await prisma.rateTier.findMany({
    where: {
      product: { productType, isActive: true, institution: { isActive: true } },
    },
    select: {
      tenureMonths: true,
      interestRatePct: true,
      product: { select: { institution: { select: { type: true } } } },
    },
  });

  const byTenure = new Map<number, Record<InstitutionType, number | null>>();
  for (const tier of tiers) {
    const tenure = tier.tenureMonths;
    const type = tier.product.institution.type;
    const rate = Number(tier.interestRatePct);
    if (!byTenure.has(tenure)) {
      byTenure.set(tenure, { BANK: null, GOVERNMENT: null, INVESTMENT_ORG: null });
    }
    const row = byTenure.get(tenure)!;
    row[type] = row[type] === null ? rate : Math.max(row[type]!, rate);
  }

  return Array.from(byTenure.entries())
    .sort(([a], [b]) => a - b)
    .map(([tenureMonths, rates]) => ({ tenureMonths, ...rates }));
}

export interface CategoryStat {
  type: InstitutionType;
  bestRate: number | null;
  avgBestRate: number | null;
  productCount: number;
}

/** Best-rate summary per institution type, for a product type — powers the bar chart. */
export async function getCategoryStats(productType: "FDR" | "DPS"): Promise<CategoryStat[]> {
  const products = await prisma.rateProduct.findMany({
    where: { productType, isActive: true, institution: { isActive: true } },
    select: {
      institution: { select: { type: true } },
      rateTiers: { select: { interestRatePct: true } },
    },
  });

  const byType = new Map<InstitutionType, number[]>();
  for (const type of TYPES) byType.set(type, []);

  for (const product of products) {
    if (product.rateTiers.length === 0) continue;
    const best = Math.max(...product.rateTiers.map((t) => Number(t.interestRatePct)));
    byType.get(product.institution.type)?.push(best);
  }

  return TYPES.map((type) => {
    const bestRates = byType.get(type) ?? [];
    return {
      type,
      bestRate: bestRates.length > 0 ? Math.max(...bestRates) : null,
      avgBestRate: bestRates.length > 0 ? bestRates.reduce((a, b) => a + b, 0) / bestRates.length : null,
      productCount: bestRates.length,
    };
  });
}

export interface TopRate {
  institutionName: string;
  institutionType: InstitutionType;
  productName: string;
  tenureMonths: number;
  interestRatePct: number;
}

/** The single highest rate currently tracked, for the "best rate today" headline. */
export async function getTopRate(): Promise<TopRate | null> {
  const tier = await prisma.rateTier.findFirst({
    where: { product: { isActive: true, institution: { isActive: true } } },
    orderBy: { interestRatePct: "desc" },
    select: {
      tenureMonths: true,
      interestRatePct: true,
      product: {
        select: { name: true, institution: { select: { name: true, type: true } } },
      },
    },
  });
  if (!tier) return null;
  return {
    institutionName: tier.product.institution.name,
    institutionType: tier.product.institution.type,
    productName: tier.product.name,
    tenureMonths: tier.tenureMonths,
    interestRatePct: Number(tier.interestRatePct),
  };
}

export interface TrendStatus {
  hasEnoughData: boolean;
  firstSnapshotAt: Date | null;
  snapshotCount: number;
  daysTracked: number;
}

/** Honest status of the history-tracking pipeline — never fabricates a trend. */
export async function getTrendStatus(): Promise<TrendStatus> {
  const [snapshotCount, first] = await Promise.all([
    prisma.rateHistory.count(),
    prisma.rateHistory.findFirst({ orderBy: { recordedAt: "asc" }, select: { recordedAt: true } }),
  ]);
  const distinctDays = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(DISTINCT DATE("recordedAt")) as count FROM "RateHistory"
  `;
  const daysTracked = Number(distinctDays[0]?.count ?? 0);
  return {
    hasEnoughData: daysTracked >= 14,
    firstSnapshotAt: first?.recordedAt ?? null,
    snapshotCount,
    daysTracked,
  };
}
