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
