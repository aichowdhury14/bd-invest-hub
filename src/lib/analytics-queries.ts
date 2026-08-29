import { prisma } from "@/lib/prisma";
import type { InstitutionType } from "@prisma/client";

const DAYS = 14;

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function lastNDays(n: number): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    days.push(dayKey(d));
  }
  return days;
}

export async function getDashboardStats() {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - DAYS);

  const [institutionCount, productCount, rateTierCount, pageViews, calculatorEvents] =
    await Promise.all([
      prisma.institution.count(),
      prisma.rateProduct.count(),
      prisma.rateTier.count(),
      prisma.pageViewEvent.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true, path: true, sessionId: true },
      }),
      prisma.calculatorEvent.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true, productType: true, sessionId: true },
      }),
    ]);

  const days = lastNDays(DAYS);
  const pageViewsByDay = new Map<string, Set<string>>();
  const calcEventsByDay = new Map<string, number>();
  for (const day of days) {
    pageViewsByDay.set(day, new Set());
    calcEventsByDay.set(day, 0);
  }

  const allSessions = new Set<string>();
  const pathCounts = new Map<string, number>();
  for (const ev of pageViews) {
    const key = dayKey(ev.createdAt);
    pageViewsByDay.get(key)?.add(ev.sessionId);
    allSessions.add(ev.sessionId);
    pathCounts.set(ev.path, (pathCounts.get(ev.path) ?? 0) + 1);
  }
  for (const ev of calculatorEvents) {
    const key = dayKey(ev.createdAt);
    calcEventsByDay.set(key, (calcEventsByDay.get(key) ?? 0) + 1);
    allSessions.add(ev.sessionId);
  }

  const dailySeries = days.map((day) => ({
    day: day.slice(5), // MM-DD
    visitors: pageViewsByDay.get(day)?.size ?? 0,
    calculations: calcEventsByDay.get(day) ?? 0,
  }));

  const topPaths = Array.from(pathCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([path, views]) => ({ path, views }));

  return {
    institutionCount,
    productCount,
    rateTierCount,
    totalPageViews: pageViews.length,
    totalCalculatorUses: calculatorEvents.length,
    distinctSessions: allSessions.size,
    dailySeries,
    topPaths,
  };
}

export interface TrendingProduct {
  productId: string;
  institutionName: string;
  institutionType: InstitutionType;
  productName: string;
  calcCount: number;
  compareCount: number;
}

const MIN_TRENDING_ENTRIES = 3;

/**
 * Real activity only — returns [] (not a placeholder list) until at least
 * MIN_TRENDING_ENTRIES distinct products have logged events, so the widget
 * never shows a sparse, unconvincing "trending" list this early on.
 */
export async function getTrendingProducts(days = 7, limit = 5): Promise<TrendingProduct[]> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);

  const [calcEvents, compareEvents] = await Promise.all([
    prisma.calculatorEvent.findMany({
      where: { createdAt: { gte: since }, productId: { not: null } },
      select: { productId: true },
    }),
    prisma.compareEvent.findMany({
      where: { createdAt: { gte: since }, productId: { not: null } },
      select: { productId: true },
    }),
  ]);

  const calcCounts = new Map<string, number>();
  for (const ev of calcEvents) {
    if (!ev.productId) continue;
    calcCounts.set(ev.productId, (calcCounts.get(ev.productId) ?? 0) + 1);
  }
  const compareCounts = new Map<string, number>();
  for (const ev of compareEvents) {
    if (!ev.productId) continue;
    compareCounts.set(ev.productId, (compareCounts.get(ev.productId) ?? 0) + 1);
  }

  const productIds = new Set([...calcCounts.keys(), ...compareCounts.keys()]);
  if (productIds.size < MIN_TRENDING_ENTRIES) return [];

  const products = await prisma.rateProduct.findMany({
    where: { id: { in: Array.from(productIds) } },
    select: { id: true, name: true, institution: { select: { name: true, type: true } } },
  });

  return products
    .map((p) => ({
      productId: p.id,
      institutionName: p.institution.name,
      institutionType: p.institution.type,
      productName: p.name,
      calcCount: calcCounts.get(p.id) ?? 0,
      compareCount: compareCounts.get(p.id) ?? 0,
    }))
    .sort((a, b) => b.calcCount + b.compareCount - (a.calcCount + a.compareCount))
    .slice(0, limit);
}

export interface RelatedProduct {
  productId: string;
  institutionName: string;
  institutionType: InstitutionType;
  productName: string;
  /** How many distinct real sessions touched both this product and the source product. */
  coOccurrences: number;
}

const MIN_CO_OCCURRENCE_SESSIONS = 2;

/**
 * Item-based co-occurrence: "people who looked at this product also looked
 * at these" — counted from real sessions that touched more than one product
 * (via the calculator or the compare picker) in the last `days`, not
 * inferred or predicted. A pair needs at least MIN_CO_OCCURRENCE_SESSIONS
 * distinct sessions before it's surfaced, so a single visitor's browsing
 * never masquerades as a pattern.
 */
export async function getRelatedProducts(
  productId: string,
  days = 90,
  limit = 4
): Promise<RelatedProduct[]> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);

  const [calcEvents, compareEvents] = await Promise.all([
    prisma.calculatorEvent.findMany({
      where: { createdAt: { gte: since }, productId: { not: null } },
      select: { productId: true, sessionId: true },
    }),
    prisma.compareEvent.findMany({
      where: { createdAt: { gte: since }, productId: { not: null } },
      select: { productId: true, sessionId: true },
    }),
  ]);

  // Build session -> set of distinct products touched, from both event types.
  const sessionProducts = new Map<string, Set<string>>();
  for (const ev of [...calcEvents, ...compareEvents]) {
    if (!ev.productId) continue;
    const set = sessionProducts.get(ev.sessionId) ?? new Set<string>();
    set.add(ev.productId);
    sessionProducts.set(ev.sessionId, set);
  }

  // For every session that touched productId, count every other product it
  // also touched — one vote per session, not per event, so a session that
  // repeatedly recalculated the same pair doesn't inflate its own count.
  const coOccurrenceCounts = new Map<string, number>();
  for (const productsInSession of sessionProducts.values()) {
    if (!productsInSession.has(productId)) continue;
    for (const otherId of productsInSession) {
      if (otherId === productId) continue;
      coOccurrenceCounts.set(otherId, (coOccurrenceCounts.get(otherId) ?? 0) + 1);
    }
  }

  const qualifying = Array.from(coOccurrenceCounts.entries()).filter(
    ([, count]) => count >= MIN_CO_OCCURRENCE_SESSIONS
  );
  if (qualifying.length === 0) return [];

  const topIds = qualifying
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  const products = await prisma.rateProduct.findMany({
    where: { id: { in: topIds } },
    select: { id: true, name: true, institution: { select: { name: true, type: true } } },
  });
  const countById = new Map(qualifying);

  return products
    .map((p) => ({
      productId: p.id,
      institutionName: p.institution.name,
      institutionType: p.institution.type,
      productName: p.name,
      coOccurrences: countById.get(p.id) ?? 0,
    }))
    .sort((a, b) => b.coOccurrences - a.coOccurrences);
}

export interface PopularAmountTenure {
  amount: number;
  tenureMonths: number;
  count: number;
}

const MIN_POPULAR_SESSIONS = 3;

/**
 * The most common (amount, tenure) combinations real visitors have actually
 * entered on the calculator, bucketed to round amounts so near-duplicate
 * entries (99,900 vs 100,000) count together. Not a prediction of what a
 * given user wants — just what other real people have picked, offered as a
 * quick-start suggestion. Returns [] until enough real sessions exist.
 */
export async function getPopularAmountTenures(days = 90, limit = 4): Promise<PopularAmountTenure[]> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);

  const events = await prisma.calculatorEvent.findMany({
    where: { createdAt: { gte: since } },
    select: { amount: true, tenureMonths: true, sessionId: true },
  });

  // Bucket amount to the nearest sensible round number so 99,500 and 100,000
  // aren't treated as different choices — one bucket per order of magnitude.
  function bucketAmount(amount: number): number {
    if (amount <= 0) return 0;
    const magnitude = Math.pow(10, Math.floor(Math.log10(amount)));
    const step = magnitude >= 100000 ? magnitude / 2 : magnitude;
    return Math.round(amount / step) * step;
  }

  // One vote per session per combo, so a single visitor adjusting a slider
  // back and forth doesn't inflate a combo's popularity.
  const seenPerSession = new Map<string, Set<string>>();
  const comboCounts = new Map<string, { amount: number; tenureMonths: number; count: number }>();
  for (const ev of events) {
    const amount = bucketAmount(Number(ev.amount));
    if (amount <= 0 || ev.tenureMonths <= 0) continue;
    const key = `${amount}:${ev.tenureMonths}`;

    const seen = seenPerSession.get(ev.sessionId) ?? new Set<string>();
    if (seen.has(key)) continue;
    seen.add(key);
    seenPerSession.set(ev.sessionId, seen);

    const existing = comboCounts.get(key);
    if (existing) {
      existing.count++;
    } else {
      comboCounts.set(key, { amount, tenureMonths: ev.tenureMonths, count: 1 });
    }
  }

  return Array.from(comboCounts.values())
    .filter((c) => c.count >= MIN_POPULAR_SESSIONS)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
