import { runScrapers } from "./runner";
import type { Scraper } from "./types";

// Add real scrapers here as they're built (see template-bank-scraper.ts), e.g.:
//   import { bracBankScraper } from "./brac-bank";
//   const scrapers: Scraper[] = [bracBankScraper];
const scrapers: Scraper[] = [];

runScrapers(scrapers);
