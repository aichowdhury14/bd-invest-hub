import { PrismaClient } from "@prisma/client";
import type { Scraper, ScrapedRate } from "./types";

const prisma = new PrismaClient();

/**
 * A scraped rate is only ever staged as a RateDriftFlag for admin review — it
 * never writes to RateTier directly. Financial figures on the live site must
 * stay human-verified; see the drift-review admin page for the approve/reject
 * step that actually applies a change.
 */
async function stageDrift(productId: string, sourceUrl: string, rate: ScrapedRate) {
  const current = await prisma.rateTier.findFirst({
    where: { productId, tenureMonths: rate.tenureMonths },
    orderBy: { updatedAt: "desc" },
  });

  const currentPct = current ? Number(current.interestRatePct) : null;
  if (currentPct !== null && Math.abs(currentPct - rate.interestRatePct) < 0.0005) {
    return false; // unchanged — nothing to flag
  }

  await prisma.rateDriftFlag.create({
    data: {
      productId,
      tenureMonths: rate.tenureMonths,
      currentRatePct: currentPct,
      proposedRatePct: rate.interestRatePct,
      sourceUrl,
      status: "PENDING",
    },
  });
  return true;
}

/**
 * Runs each scraper and stages any detected rate differences as PENDING
 * RateDriftFlag rows for admin review — it never writes to RateTier directly
 * (see stageDrift above). Every run — success or failure — is written to
 * ScrapeLog so the admin panel's Scrape Logs page shows scraper health over time.
 */
export async function runScrapers(scrapers: Scraper[]) {
  if (scrapers.length === 0) {
    console.log("No scrapers registered yet — see scripts/scrapers/template-bank-scraper.ts");
    return;
  }

  for (const scraper of scrapers) {
    try {
      const result = await scraper.run();

      let flagged = 0;
      for (const rate of result.rates) {
        const wasFlagged = await stageDrift(result.productId, result.sourceUrl, rate);
        if (wasFlagged) flagged++;
      }

      await prisma.scrapeLog.create({
        data: {
          institutionId: scraper.institutionId,
          status: "SUCCESS",
          message: `Checked ${result.rates.length} rate tiers from ${result.sourceUrl}; ${flagged} flagged for review`,
        },
      });
      console.log(`[ok] ${scraper.name}: ${result.rates.length} checked, ${flagged} flagged`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await prisma.scrapeLog.create({
        data: { institutionId: scraper.institutionId, status: "FAILURE", message },
      });
      console.error(`[fail] ${scraper.name}: ${message}`);
    }
  }

  await prisma.$disconnect();
}
