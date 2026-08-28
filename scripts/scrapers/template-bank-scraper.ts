// TEMPLATE — copy this file to build a real scraper for one bank's published rate
// page. It is intentionally not wired into run-all.ts, because it targets a
// placeholder URL/selector, not a verified real page.
//
// How to adapt it:
//   1. Find the bank's public FDR/DPS rate-sheet page (HTML table, ideally — a PDF
//      rate sheet needs `pdf-parse` instead of cheerio; ask for a PDF example if
//      you hit one).
//   2. Open it in a browser, inspect the table, and update the selectors below.
//   3. Set `productId` to the matching RateProduct.id (check the admin panel or
//      prisma/seed.ts for the id, e.g. "bank-brac-bank-fixed-deposit-receipt").
//   4. Register the scraper in run-all.ts.
//   5. Run `npm run scrape` locally against a dev DATABASE_URL and check the
//      /admin/scrape-logs page and the product's rate tiers before relying on it.
//
// Respect the target site's robots.txt and terms of use, and keep the schedule
// modest (the default workflow runs once a day) — this is a courtesy scraper for
// publicly published rate sheets, not a high-frequency crawler.

import * as cheerio from "cheerio";
import type { Scraper, ScrapedRate } from "./types";

const SOURCE_URL = "https://example-bank.example/fdr-rates"; // TODO: real rate-sheet URL

export const templateBankScraper: Scraper = {
  name: "TEMPLATE — replace me",
  institutionId: "bank-replace-me", // TODO: match prisma/seed.ts institution id
  async run() {
    const res = await fetch(SOURCE_URL, {
      headers: { "User-Agent": "bd-invest-hub-rate-checker/1.0 (+informational, non-commercial)" },
    });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    const rates: ScrapedRate[] = [];
    // TODO: replace this selector with the real table's row selector.
    $("table.rate-table tbody tr").each((_, row) => {
      const cells = $(row).find("td").map((__, td) => $(td).text().trim()).get();
      const tenureMonths = parseTenureToMonths(cells[0]);
      const interestRatePct = parseFloat(cells[1]?.replace("%", ""));
      if (tenureMonths && !Number.isNaN(interestRatePct)) {
        rates.push({ tenureMonths, minAmount: 0, interestRatePct });
      }
    });

    if (rates.length === 0) {
      throw new Error("Parsed 0 rate rows — the page structure may have changed");
    }

    return {
      productId: "bank-replace-me-fixed-deposit-receipt", // TODO: real RateProduct.id
      sourceUrl: SOURCE_URL,
      rates,
    };
  },
};

/** Parses labels like "3 Months", "1 Year", "18 months" into a month count. */
function parseTenureToMonths(label: string): number | null {
  const match = label?.match(/(\d+)\s*(month|year)/i);
  if (!match) return null;
  const value = parseInt(match[1], 10);
  return /year/i.test(match[2]) ? value * 12 : value;
}
