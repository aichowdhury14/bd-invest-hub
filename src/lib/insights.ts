import { prisma } from "@/lib/prisma";
import type { InstitutionType, ProductType } from "@prisma/client";
import { CURRENT_INFLATION } from "@/lib/economic-context";
import type { BankingMode } from "@/lib/labels";

const TYPES: InstitutionType[] = ["BANK", "GOVERNMENT", "INVESTMENT_ORG", "DIGITAL_BANK"];

/** Prisma `RateProduct.isIslamic` filter fragment for a given banking-mode
 *  selection — `undefined` for "ALL" so the where-clause key is simply
 *  omitted rather than matching both true and false explicitly. */
function isIslamicFilter(bankingMode: BankingMode): boolean | undefined {
  if (bankingMode === "ISLAMIC") return true;
  if (bankingMode === "CONVENTIONAL") return false;
  return undefined;
}

export interface YieldCurvePoint {
  tenureMonths: number;
  BANK: number | null;
  GOVERNMENT: number | null;
  INVESTMENT_ORG: number | null;
  DIGITAL_BANK: number | null;
}

/**
 * A single active rate tier plus just enough of its product/institution
 * context to power every chart on the Insights page. Fetched once per
 * banking-mode selection (see `getInsightsRateTiers`) and reused by every
 * `build*`/`get*` function below instead of each one re-querying the same
 * rows — see that function's comment for why this matters.
 */
interface InsightsRateTier {
  tenureMonths: number;
  interestRatePct: number;
  productType: ProductType;
  productName: string;
  institutionName: string;
  institutionType: InstitutionType;
}

/**
 * Every active rate tier for active, non-government products matching the
 * given banking mode — the one query the whole Insights page is built from.
 *
 * Previously each chart/stat had its own `prisma.rateTier.findMany` (or
 * `rateProduct.findMany` with a `rateTiers` include covering the same rows),
 * so loading the page fired 7 near-identical queries in one `Promise.all`.
 * Against Supabase's pooled connection (connection_limit: 3), most of those
 * queued behind each other instead of running concurrently — the exact
 * mechanism that once timed out `next build`'s static generation (see the
 * comment on `buildMarketInsights`) and, worse for users, made every
 * Conventional/Islamic toggle click feel like a hang: the whole page is a
 * dynamic route once `searchParams.mode` is read, so there's no cache to
 * fall back on and every click re-pays the full queueing cost. Fetching
 * every tier once and deriving all charts from it in JS turns 7 round-trips
 * into 1, independent of pool size. (The page now also caches these loaders
 * at the data layer — see `insights-cache.ts`.)
 */
async function getInsightsRateTiers(bankingMode: BankingMode = "ALL"): Promise<InsightsRateTier[]> {
  const tiers = await prisma.rateTier.findMany({
    where: {
      product: {
        isActive: true,
        isIslamic: isIslamicFilter(bankingMode),
        institution: { isActive: true },
      },
    },
    select: {
      tenureMonths: true,
      interestRatePct: true,
      product: {
        select: {
          productType: true,
          name: true,
          institution: { select: { name: true, type: true } },
        },
      },
    },
  });

  return tiers.map((tier) => ({
    tenureMonths: tier.tenureMonths,
    interestRatePct: Number(tier.interestRatePct),
    productType: tier.product.productType,
    productName: tier.product.name,
    institutionName: tier.product.institution.name,
    institutionType: tier.product.institution.type,
  }));
}

/**
 * For a given product type (FDR or DPS), the best rate offered at each tenure,
 * grouped by institution type — a "yield curve" per category. Only tenures with
 * at least one real rate tier appear; missing cells stay null (never interpolated).
 */
function buildYieldCurve(tiers: InsightsRateTier[], productType: "FDR" | "DPS"): YieldCurvePoint[] {
  const byTenure = new Map<number, Record<InstitutionType, number | null>>();
  for (const tier of tiers) {
    if (tier.productType !== productType) continue;
    const tenure = tier.tenureMonths;
    const type = tier.institutionType;
    if (!byTenure.has(tenure)) {
      byTenure.set(tenure, { BANK: null, GOVERNMENT: null, INVESTMENT_ORG: null, DIGITAL_BANK: null });
    }
    const row = byTenure.get(tenure)!;
    row[type] = row[type] === null ? tier.interestRatePct : Math.max(row[type]!, tier.interestRatePct);
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
function buildCategoryStats(tiers: InsightsRateTier[], productType: "FDR" | "DPS"): CategoryStat[] {
  // Best rate per (institution, product) pair — mirrors the old per-product
  // grouping (a product with no tiers simply contributes nothing here).
  const bestByProduct = new Map<string, { type: InstitutionType; best: number }>();
  for (const tier of tiers) {
    if (tier.productType !== productType) continue;
    const key = `${tier.institutionName}::${tier.productName}`;
    const existing = bestByProduct.get(key);
    if (!existing || tier.interestRatePct > existing.best) {
      bestByProduct.set(key, { type: tier.institutionType, best: tier.interestRatePct });
    }
  }

  const byType = new Map<InstitutionType, number[]>();
  for (const type of TYPES) byType.set(type, []);
  for (const { type, best } of bestByProduct.values()) {
    byType.get(type)?.push(best);
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
 * crowd out everyone else. Government instruments are included, same as before.
 */
function buildTopRates(tiers: InsightsRateTier[], limit = 10): TopRate[] {
  const sorted = [...tiers].sort((a, b) => b.interestRatePct - a.interestRatePct);

  const seen = new Set<string>();
  const result: TopRate[] = [];
  for (const tier of sorted) {
    if (seen.has(tier.institutionName)) continue;
    seen.add(tier.institutionName);
    result.push({
      institutionName: tier.institutionName,
      institutionType: tier.institutionType,
      productName: tier.productName,
      productType: tier.productType,
      tenureMonths: tier.tenureMonths,
      interestRatePct: tier.interestRatePct,
    });
    if (result.length >= limit) break;
  }
  return result;
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

/**
 * Every government instrument's best rate by tenure — Sanchayapatro variants,
 * T-Bond, T-Bill side by side. These are never Islamic products, so
 * bankingMode="ISLAMIC" correctly returns nothing rather than silently
 * ignoring the filter.
 */
export async function getGovernmentInstrumentRates(
  bankingMode: BankingMode = "ALL"
): Promise<GovtInstrumentRate[]> {
  if (bankingMode === "ISLAMIC") return [];
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
  institutionTypes: Record<string, InstitutionType>;
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
function buildFDRHeatmap(tiers: InsightsRateTier[], topN = 14): RateHeatmapData {
  const fdrTiers = tiers.filter((t) => t.productType === "FDR");

  // Common tenures = the ones offered by the most institutions.
  const tenureFrequency = new Map<number, number>();
  for (const tier of fdrTiers) {
    tenureFrequency.set(tier.tenureMonths, (tenureFrequency.get(tier.tenureMonths) ?? 0) + 1);
  }
  const tenures = Array.from(tenureFrequency.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([tenure]) => tenure)
    .sort((a, b) => a - b);
  const tenureSet = new Set(tenures);

  const byInstitution = new Map<string, { type: InstitutionType; rates: Record<number, number> }>();
  for (const tier of fdrTiers) {
    if (!tenureSet.has(tier.tenureMonths)) continue;
    if (!byInstitution.has(tier.institutionName)) {
      byInstitution.set(tier.institutionName, { type: tier.institutionType, rates: {} });
    }
    const entry = byInstitution.get(tier.institutionName)!;
    entry.rates[tier.tenureMonths] = entry.rates[tier.tenureMonths]
      ? Math.max(entry.rates[tier.tenureMonths], tier.interestRatePct)
      : tier.interestRatePct;
  }

  const allInstitutions = Array.from(byInstitution.entries())
    .map(([name, { type, rates }]) => {
      const best = Object.values(rates);
      return { name, type, rates, bestRate: best.length > 0 ? Math.max(...best) : -1 };
    })
    .filter((p) => p.bestRate >= 0)
    .sort((a, b) => b.bestRate - a.bestRate);

  const pinned = allInstitutions.filter((p) => HEATMAP_PINNED_INSTITUTIONS.includes(p.name));
  const rest = allInstitutions.filter((p) => !HEATMAP_PINNED_INSTITUTIONS.includes(p.name));
  const withBest = [...pinned, ...rest.slice(0, Math.max(0, topN - pinned.length))].sort(
    (a, b) => b.bestRate - a.bestRate
  );

  const rates: Record<string, Record<number, number>> = {};
  const institutionTypes: Record<string, InstitutionType> = {};
  for (const p of withBest) {
    rates[p.name] = p.rates;
    institutionTypes[p.name] = p.type;
  }

  return { institutions: withBest.map((p) => p.name), tenures, rates, institutionTypes };
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

export interface InflationBeatStat {
  beatingCount: number;
  totalCount: number;
  bestMarginPct: number | null;
}

/** How many currently tracked rate tiers clear the latest published inflation figure. */
function buildInflationBeatStat(tiers: InsightsRateTier[]): InflationBeatStat {
  const rates = tiers.map((t) => t.interestRatePct);
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
 *
 * Pure function over already-fetched data (not its own queries) — the insights
 * page fetches fdrCurve/fdrStats/dpsStats/inflationStat once for its own
 * sections and passes them in here, instead of this function re-querying the
 * same tables again. Firing 10+ independent queries in one Promise.all against
 * a pooled connection (connection_limit: 3 on Supabase's pgbouncer) was timing
 * out `next build`'s static generation for this page.
 */
export function buildMarketInsights(data: {
  fdrCurve: YieldCurvePoint[];
  fdrStats: CategoryStat[];
  dpsStats: CategoryStat[];
  inflationStat: InflationBeatStat;
}): MarketInsight[] {
  const { fdrCurve, fdrStats, dpsStats, inflationStat } = data;

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

export interface InsightsData {
  fdrCurve: YieldCurvePoint[];
  dpsCurve: YieldCurvePoint[];
  fdrStats: CategoryStat[];
  dpsStats: CategoryStat[];
  topRates: TopRate[];
  heatmap: RateHeatmapData;
  inflationStat: InflationBeatStat;
  marketInsights: MarketInsight[];
}

/**
 * Everything the Insights page needs for a given banking-mode selection, from
 * a single database round-trip (see `getInsightsRateTiers`). This is the one
 * function `src/app/insights/page.tsx` should call for its mode-dependent
 * data — do not reintroduce separate `get*` calls per chart, that's the
 * queueing/hang problem this refactor fixes.
 */
export async function getInsightsData(bankingMode: BankingMode = "ALL"): Promise<InsightsData> {
  const tiers = await getInsightsRateTiers(bankingMode);

  const fdrCurve = buildYieldCurve(tiers, "FDR");
  const dpsCurve = buildYieldCurve(tiers, "DPS");
  const fdrStats = buildCategoryStats(tiers, "FDR");
  const dpsStats = buildCategoryStats(tiers, "DPS");
  const topRates = buildTopRates(tiers, 10);
  const heatmap = buildFDRHeatmap(tiers, 14);
  const inflationStat = buildInflationBeatStat(tiers);
  const marketInsights = buildMarketInsights({ fdrCurve, fdrStats, dpsStats, inflationStat });

  return { fdrCurve, dpsCurve, fdrStats, dpsStats, topRates, heatmap, inflationStat, marketInsights };
}
