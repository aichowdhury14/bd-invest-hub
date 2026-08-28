import { PrismaClient } from "@prisma/client";
import type { Scraper } from "./types";

const prisma = new PrismaClient();

/**
 * Runs each scraper, replacing that product's previously-SCRAPED tiers with the
 * freshly-scraped ones (manually-entered tiers are never touched by this path).
 * Every run — success or failure — is written to ScrapeLog so the admin panel's
 * Scrape Logs page shows scraper health over time.
 */
export async function runScrapers(scrapers: Scraper[]) {
  if (scrapers.length === 0) {
    console.log("No scrapers registered yet — see scripts/scrapers/template-bank-scraper.ts");
    return;
  }

  for (const scraper of scrapers) {
    try {
      const result = await scraper.run();

      await prisma.$transaction([
        prisma.rateTier.deleteMany({
          where: { productId: result.productId, source: "SCRAPED" },
        }),
        prisma.rateTier.createMany({
          data: result.rates.map((r) => ({
            productId: result.productId,
            tenureMonths: r.tenureMonths,
            minAmount: r.minAmount,
            maxAmount: r.maxAmount ?? null,
            interestRatePct: r.interestRatePct,
            source: "SCRAPED" as const,
            sourceUrl: result.sourceUrl,
            scrapedAt: new Date(),
          })),
        }),
      ]);

      await prisma.scrapeLog.create({
        data: {
          institutionId: scraper.institutionId,
          status: "SUCCESS",
          message: `Scraped ${result.rates.length} rate tiers from ${result.sourceUrl}`,
        },
      });
      console.log(`[ok] ${scraper.name}: ${result.rates.length} tiers`);
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
