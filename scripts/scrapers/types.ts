export interface ScrapedRate {
  tenureMonths: number;
  minAmount: number;
  maxAmount?: number;
  interestRatePct: number;
}

export interface ScraperResult {
  /** The RateProduct.id (from the seed data or admin panel) these rates belong to. */
  productId: string;
  /** The exact page the rates were read from, shown to users and stored on each tier. */
  sourceUrl: string;
  rates: ScrapedRate[];
}

export interface Scraper {
  /** Human-readable name for logs, e.g. "BRAC Bank FDR". */
  name: string;
  /** The Institution.id this scraper's ScrapeLog entries should be attributed to. */
  institutionId: string;
  run(): Promise<ScraperResult>;
}
