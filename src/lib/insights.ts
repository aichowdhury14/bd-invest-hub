import { prisma } from "@/lib/prisma";
import type { InstitutionType, ProductType } from "@prisma/client";

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
  productType: ProductType;
  tenureMonths: number;
  interestRatePct: number;
}

/**
 * The N highest rates currently tracked, one entry per institution — a "best
 * deals" leaderboard. Deduplicated by institution (rather than raw rate tiers)
 * so one institution's several amount-tiered rows on the same product don't
 * crowd out everyone else.
 */
export async function getTopRates(limit = 10): Promise<TopRate[]> {
  const tiers = await prisma.rateTier.findMany({
    where: { product: { isActive: true, institution: { isActive: true } } },
    orderBy: { interestRatePct: "desc" },
    select: {
      tenureMonths: true,
      interestRatePct: true,
      product: {
        select: { name: true, productType: true, institution: { select: { name: true, type: true } } },
      },
    },
  });

  const seen = new Set<string>();
  const result: TopRate[] = [];
  for (const tier of tiers) {
    const institutionName = tier.product.institution.name;
    if (seen.has(institutionName)) continue;
    seen.add(institutionName);
    result.push({
      institutionName,
      institutionType: tier.product.institution.type,
      productName: tier.product.name,
      productType: tier.product.productType,
      tenureMonths: tier.tenureMonths,
      interestRatePct: Number(tier.interestRatePct),
    });
    if (result.length >= limit) break;
  }
  return result;
}

/** The single highest rate currently tracked, for the "best rate today" headline. */
export async function getTopRate(): Promise<TopRate | null> {
  const [top] = await getTopRates(1);
  return top ?? null;
}

export interface CompositionStat {
  type: InstitutionType;
  count: number;
}

/** How many active institutions of each type we track — a market-composition overview. */
export async function getInstitutionComposition(): Promise<CompositionStat[]> {
  const institutions = await prisma.institution.findMany({
    where: { isActive: true },
    select: { type: true },
  });
  const counts = new Map<InstitutionType, number>();
  for (const type of TYPES) counts.set(type, 0);
  for (const inst of institutions) counts.set(inst.type, (counts.get(inst.type) ?? 0) + 1);
  return TYPES.map((type) => ({ type, count: counts.get(type) ?? 0 }));
}

export interface GovtInstrumentRate {
  productName: string;
  productType: ProductType;
  tenureMonths: number;
  interestRatePct: number;
}

/** Every government instrument's best rate by tenure — Sanchayapatro variants, T-Bond, T-Bill side by side. */
export async function getGovernmentInstrumentRates(): Promise<GovtInstrumentRate[]> {
  const tiers = await prisma.rateTier.findMany({
    where: {
      product: {
        isActive: true,
        institution: { isActive: true, type: "GOVERNMENT" },
      },
    },
    orderBy: [{ product: { name: "asc" } }, { tenureMonths: "asc" }],
    select: {
      tenureMonths: true,
      interestRatePct: true,
      product: { select: { name: true, productType: true } },
    },
  });

  // Best rate per (product, tenure) — some products have amount-tiered duplicates.
  const byKey = new Map<string, GovtInstrumentRate>();
  for (const tier of tiers) {
    const key = `${tier.product.name}::${tier.tenureMonths}`;
    const rate = Number(tier.interestRatePct);
    const existing = byKey.get(key);
    if (!existing || rate > existing.interestRatePct) {
      byKey.set(key, {
        productName: tier.product.name,
        productType: tier.product.productType,
        tenureMonths: tier.tenureMonths,
        interestRatePct: rate,
      });
    }
  }
  return Array.from(byKey.values());
}

export interface RateHeatmapData {
  institutions: string[];
  tenures: number[];
  /** rate[institutionName][tenureMonths] -> best rate, or undefined if not offered. */
  rates: Record<string, Record<number, number>>;
}

/**
 * FDR rates for the top institutions (by best rate) across the most commonly
 * offered tenures — a compact grid for a heatmap. Deliberately capped in size
 * (topN institutions x common tenures) rather than the full matrix, which would
 * be mostly-empty and unreadable.
 */
export async function getFDRHeatmap(topN = 14): Promise<RateHeatmapData> {
  const products = await prisma.rateProduct.findMany({
    where: { productType: "FDR", isActive: true, institution: { isActive: true } },
    select: {
      institution: { select: { name: true } },
      rateTiers: { select: { tenureMonths: true, interestRatePct: true } },
    },
  });

  // Common tenures = the ones offered by the most institutions.
  const tenureFrequency = new Map<number, number>();
  for (const product of products) {
    for (const tier of product.rateTiers) {
      tenureFrequency.set(tier.tenureMonths, (tenureFrequency.get(tier.tenureMonths) ?? 0) + 1);
    }
  }
  const tenures = Array.from(tenureFrequency.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([tenure]) => tenure)
    .sort((a, b) => a - b);
  const tenureSet = new Set(tenures);

  const withBest = products
    .map((product) => {
      const rates: Record<number, number> = {};
      for (const tier of product.rateTiers) {
        if (!tenureSet.has(tier.tenureMonths)) continue;
        const rate = Number(tier.interestRatePct);
        rates[tier.tenureMonths] = rates[tier.tenureMonths]
          ? Math.max(rates[tier.tenureMonths], rate)
          : rate;
      }
      const best = Object.values(rates);
      return { name: product.institution.name, rates, bestRate: best.length > 0 ? Math.max(...best) : -1 };
    })
    .filter((p) => p.bestRate >= 0)
    .sort((a, b) => b.bestRate - a.bestRate)
    .slice(0, topN);

  const rates: Record<string, Record<number, number>> = {};
  for (const p of withBest) rates[p.name] = p.rates;

  return { institutions: withBest.map((p) => p.name), tenures, rates };
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
