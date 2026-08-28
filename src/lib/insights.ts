import { prisma } from "@/lib/prisma";
import type { InstitutionType, ProductType } from "@prisma/client";
import { CURRENT_INFLATION } from "@/lib/economic-context";

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
 * Always shown in the FDR heatmap regardless of rank — both are among the most
 * recognized private banks in Bangladesh, so users expect to see them for
 * comparison even when their published rate isn't table-topping.
 */
const HEATMAP_PINNED_INSTITUTIONS = ["BRAC Bank", "The City Bank"];

/**
 * FDR rates for the top institutions (by best rate) across the most commonly
 * offered tenures — a compact grid for a heatmap. Deliberately capped in size
 * (topN institutions x common tenures) rather than the full matrix, which would
 * be mostly-empty and unreadable. A small set of well-known banks is pinned in
 * (see HEATMAP_PINNED_INSTITUTIONS) even if their rate falls outside topN.
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

  const allInstitutions = products
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
    .sort((a, b) => b.bestRate - a.bestRate);

  const pinned = allInstitutions.filter((p) => HEATMAP_PINNED_INSTITUTIONS.includes(p.name));
  const rest = allInstitutions.filter((p) => !HEATMAP_PINNED_INSTITUTIONS.includes(p.name));
  const withBest = [...pinned, ...rest.slice(0, Math.max(0, topN - pinned.length))].sort(
    (a, b) => b.bestRate - a.bestRate
  );

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

interface InflationBeatStat {
  beatingCount: number;
  totalCount: number;
  bestMarginPct: number | null;
}

/** How many currently tracked rate tiers clear the latest published inflation figure. */
async function getInflationBeatStat(): Promise<InflationBeatStat> {
  const tiers = await prisma.rateTier.findMany({
    where: { product: { isActive: true, institution: { isActive: true } } },
    select: { interestRatePct: true },
  });
  const rates = tiers.map((t) => Number(t.interestRatePct));
  const beating = rates.filter((r) => r > CURRENT_INFLATION.ratePct);
  return {
    beatingCount: beating.length,
    totalCount: rates.length,
    bestMarginPct: beating.length > 0 ? Math.max(...beating) - CURRENT_INFLATION.ratePct : null,
  };
}

export interface MarketInsight {
  title: string;
  detail: string;
}

function tenureLabel(months: number): string {
  return months % 12 === 0 ? `${months / 12}yr` : `${months}mo`;
}

/**
 * Short, auto-generated observations computed purely from rates already in the
 * database (no hidden model, no future-rate guessing) — a rule-based reading of
 * today's numbers, in the same spirit as the calculator's Smart Recommendations.
 */
export async function getMarketInsights(): Promise<MarketInsight[]> {
  const [fdrCurve, fdrStats, dpsStats, inflationStat] = await Promise.all([
    getYieldCurve("FDR"),
    getCategoryStats("FDR"),
    getCategoryStats("DPS"),
    getInflationBeatStat(),
  ]);

  const insights: MarketInsight[] = [];

  const bothQuoted = fdrCurve.filter((p) => p.BANK !== null && p.GOVERNMENT !== null);
  if (bothQuoted.length > 0) {
    const point = bothQuoted[bothQuoted.length - 1];
    const spread = point.BANK! - point.GOVERNMENT!;
    const label = tenureLabel(point.tenureMonths);
    insights.push({
      title:
        spread > 0.001
          ? `Banks out-pay government instruments by ${spread.toFixed(2)} pts at ${label}`
          : spread < -0.001
            ? `Government instruments out-pay banks by ${Math.abs(spread).toFixed(2)} pts at ${label}`
            : `Banks and government instruments are tied at ${label}`,
      detail: `Best bank FDR: ${point.BANK!.toFixed(2)}% · Best government rate: ${point.GOVERNMENT!.toFixed(2)}%, both at ${label} tenure.`,
    });
  }

  const fdrBank = fdrStats.find((s) => s.type === "BANK");
  const dpsBank = dpsStats.find((s) => s.type === "BANK");
  if (fdrBank?.bestRate != null && dpsBank?.bestRate != null) {
    const gap = dpsBank.bestRate - fdrBank.bestRate;
    insights.push({
      title:
        gap > 0.001
          ? `Bank DPS plans out-price lump-sum FDR by ${gap.toFixed(2)} pts`
          : gap < -0.001
            ? `Bank FDR out-prices recurring DPS by ${Math.abs(gap).toFixed(2)} pts`
            : `Bank FDR and DPS are priced the same right now`,
      detail: `Best tracked bank FDR rate: ${fdrBank.bestRate.toFixed(2)}%. Best tracked bank DPS rate: ${dpsBank.bestRate.toFixed(2)}%.`,
    });
  }

  insights.push({
    title:
      inflationStat.beatingCount > 0
        ? `${inflationStat.beatingCount} of ${inflationStat.totalCount} tracked rates beat current inflation`
        : `No tracked rate currently beats inflation`,
    detail:
      inflationStat.bestMarginPct !== null
        ? `Best margin above ${CURRENT_INFLATION.ratePct}% inflation (${CURRENT_INFLATION.period}, ${CURRENT_INFLATION.source}): +${inflationStat.bestMarginPct.toFixed(2)} pts.`
        : `Inflation reference: ${CURRENT_INFLATION.ratePct}% (${CURRENT_INFLATION.period}, ${CURRENT_INFLATION.source}).`,
  });

  const bankPoints = fdrCurve.filter((p) => p.BANK !== null);
  if (bankPoints.length >= 2) {
    const first = bankPoints[0];
    const last = bankPoints[bankPoints.length - 1];
    const rateDiff = last.BANK! - first.BANK!;
    const shortLabel = tenureLabel(first.tenureMonths);
    const longLabel = tenureLabel(last.tenureMonths);
    insights.push({
      title:
        rateDiff > 0.001
          ? `Locking longer pays: ${shortLabel} to ${longLabel} bank FDR gains ${rateDiff.toFixed(2)} pts`
          : rateDiff < -0.001
            ? `Shorter locks pay more: ${shortLabel} bank FDR beats ${longLabel} by ${Math.abs(rateDiff).toFixed(2)} pts`
            : `Bank FDR rates are flat from ${shortLabel} to ${longLabel}`,
      detail: `${shortLabel}: ${first.BANK!.toFixed(2)}% · ${longLabel}: ${last.BANK!.toFixed(2)}%, best tracked bank rate at each tenure.`,
    });
  }

  return insights;
}
