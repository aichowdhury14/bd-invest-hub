// One-off import of real, sourced FDR/DPS/Sanchayapatra/Treasury/NBFI rates,
// researched 2026-08-28 and extended the same day with more sources (a rendering
// proxy for JS-only sites, a user-supplied Pubali PDF, a Bank Asia DPS brochure,
// and a user-supplied Dhaka Bank DPS maturity-value chart). See
// research/rate-research-2026-08-28.md for the full findings including
// everything still NOT entered here and why.
//
// Standard Chartered Bangladesh and the "Demo Bank" seed institution were
// removed entirely (see scripts/remove-institution.ts) rather than left empty:
// Standard Chartered only publishes a regulatory min-max RANGE (0.05%-5.00%),
// never a specific advertised rate, so there was nothing honest to show; Demo
// Bank was always meant to be removed before real data existed.
//
// Every row has a real sourceUrl (or, for Dhaka Bank's DPS, a note that the rate
// was mathematically back-solved from the bank's own published maturity-value
// chart — see the comment above those rows). Institutions/products with no
// verifiable current rate are intentionally left with no rate data rather than
// filled with a guess:
//   - IDLC's DPS/FDR variants beyond the ones entered, and Shanta Asset
//     Management (a mutual fund manager, not a deposit-taking institution —
//     its returns are historical/variable, not a guaranteed rate, so they don't
//     fit this schema's fixed-rate calculator; see the chat response for a
//     plain-text analysis instead).
//   - NCC Bank's only DPS rate sheet is dated Nov 2020 (unrevised since) — used
//     their fresher 2025 Kotipoti/Millionaire scheme rate instead.
//   - Uttara Bank's "Monthly Deposit Scheme" rate is published with no
//     tenure breakdown — can't enter into a tenure-keyed schema honestly, so
//     skipped.
//   - Where a bank offers several differently-branded DPS variants, one
//     representative flagship scheme was chosen (named in the comment) rather
//     than entering every variant as a separate product, to keep the
//     cross-bank comparison meaningful. Others can be added later as
//     additional named products via the admin panel.

import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

interface RateEntry {
  institutionName: string;
  productType: "FDR" | "DPS" | "SANCHAYPATRO" | "TBOND" | "TBILL";
  productNameHint?: string; // disambiguates when an institution has >1 product of the same productType
  tenureMonths: number;
  minAmount: number;
  maxAmount?: number;
  interestRatePct: number;
  sourceUrl: string;
}

// Profit-SHARING RATIO entries — for Mudaraba products that publish a
// customer:bank split instead of an advertised percentage rate. Never
// combined with RateEntry/RateTier: a ratio can't be compounded into a
// maturity amount, so it must stay out of every rate-based calculation.
interface RatioEntry {
  institutionName: string;
  productType: "FDR" | "DPS" | "SANCHAYPATRO" | "TBOND" | "TBILL";
  productNameHint?: string;
  tenureMonths: number;
  customerRatio: number;
  bankRatio: number;
  sourceUrl: string;
}

const LAC = 100_000;
const CRORE = 10_000_000;

const entries: RateEntry[] = [
  // --- Sonali Bank --- https://www.sonalibank.com.bd/PDF_file/intt_rates.pdf
  { institutionName: "Sonali Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://www.sonalibank.com.bd/PDF_file/intt_rates.pdf" },
  { institutionName: "Sonali Bank", productType: "FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://www.sonalibank.com.bd/PDF_file/intt_rates.pdf" },
  { institutionName: "Sonali Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 8.5, sourceUrl: "https://www.sonalibank.com.bd/PDF_file/intt_rates.pdf" },
  { institutionName: "Sonali Bank", productType: "FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 8.5, sourceUrl: "https://www.sonalibank.com.bd/PDF_file/intt_rates.pdf" },
  { institutionName: "Sonali Bank", productType: "FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 8.5, sourceUrl: "https://www.sonalibank.com.bd/PDF_file/intt_rates.pdf" },
  // Sonali Deposit Scheme (SDS) — flagship general DPS
  { institutionName: "Sonali Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 6.5, sourceUrl: "https://www.sonalibank.com.bd/schemes-new.php" },

  // --- Janata Bank --- https://www.jb.com.bd/assets/file/documents/rate_of_interest_2026-04-30_05-06-50am.pdf
  { institutionName: "Janata Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 8.5, sourceUrl: "https://www.jb.com.bd/assets/file/documents/rate_of_interest_2026-04-30_05-06-50am.pdf" },
  { institutionName: "Janata Bank", productType: "FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 8.75, sourceUrl: "https://www.jb.com.bd/assets/file/documents/rate_of_interest_2026-04-30_05-06-50am.pdf" },
  { institutionName: "Janata Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.jb.com.bd/assets/file/documents/rate_of_interest_2026-04-30_05-06-50am.pdf" },
  { institutionName: "Janata Bank", productType: "FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.jb.com.bd/assets/file/documents/rate_of_interest_2026-04-30_05-06-50am.pdf" },
  // Janata Bank Deposit Pension Scheme (JBDPS) — flagship
  { institutionName: "Janata Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.jb.com.bd/products/scheme_deposit" },
  { institutionName: "Janata Bank", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.jb.com.bd/products/scheme_deposit" },

  // --- Agrani Bank --- https://www.agranibank.org/index.php/home/deposits_products/Fixed-Deposit-Account
  { institutionName: "Agrani Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 8.5, sourceUrl: "https://www.agranibank.org/index.php/home/deposits_products/Fixed-Deposit-Account" },
  { institutionName: "Agrani Bank", productType: "FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 8.75, sourceUrl: "https://www.agranibank.org/index.php/home/deposits_products/Fixed-Deposit-Account" },
  { institutionName: "Agrani Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.agranibank.org/index.php/home/deposits_products/Fixed-Deposit-Account" },
  { institutionName: "Agrani Bank", productType: "FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.agranibank.org/index.php/home/deposits_products/Fixed-Deposit-Account" },
  { institutionName: "Agrani Bank", productType: "FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.agranibank.org/index.php/home/deposits_products/Fixed-Deposit-Account" },
  // Lakhpoti Deposit Scheme — flagship general DPS
  { institutionName: "Agrani Bank", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 5.0, sourceUrl: "https://www.agranibank.org/index.php/home/deposits_products/Agrani-Bank-Lakhpoti-Deposit-scheme" },
  { institutionName: "Agrani Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 5.5, sourceUrl: "https://www.agranibank.org/index.php/home/deposits_products/Agrani-Bank-Lakhpoti-Deposit-scheme" },

  // --- Rupali Bank --- https://rupalibank.com.bd/download.php?file=20251019124828-48436.pdf
  { institutionName: "Rupali Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://rupalibank.com.bd/download.php?file=20251019124828-48436.pdf" },
  { institutionName: "Rupali Bank", productType: "FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 8.5, sourceUrl: "https://rupalibank.com.bd/download.php?file=20251019124828-48436.pdf" },
  { institutionName: "Rupali Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 8.75, sourceUrl: "https://rupalibank.com.bd/download.php?file=20251019124828-48436.pdf" },
  { institutionName: "Rupali Bank", productType: "FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 8.75, sourceUrl: "https://rupalibank.com.bd/download.php?file=20251019124828-48436.pdf" },
  { institutionName: "Rupali Bank", productType: "FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 8.75, sourceUrl: "https://rupalibank.com.bd/download.php?file=20251019124828-48436.pdf" },
  // Rupali Deposit Pension Scheme (RDPS) "Shimul" — flagship
  { institutionName: "Rupali Bank", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 7.5, sourceUrl: "https://rupalibank.com.bd/product_details_deposit.php?product_info_pk=31" },
  { institutionName: "Rupali Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://rupalibank.com.bd/product_details_deposit.php?product_info_pk=31" },
  { institutionName: "Rupali Bank", productType: "DPS", tenureMonths: 96, minAmount: 0, interestRatePct: 8.5, sourceUrl: "https://rupalibank.com.bd/product_details_deposit.php?product_info_pk=31" },

  // --- Islami Bank Bangladesh --- Mudaraba profit rates (Islamic banking terminology)
  { institutionName: "Islami Bank Bangladesh", productType: "FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf" },
  { institutionName: "Islami Bank Bangladesh", productType: "FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 9.8, sourceUrl: "https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf" },
  { institutionName: "Islami Bank Bangladesh", productType: "FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf" },
  { institutionName: "Islami Bank Bangladesh", productType: "FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 10.2, sourceUrl: "https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf" },
  { institutionName: "Islami Bank Bangladesh", productType: "FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 10.5, sourceUrl: "https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf" },
  { institutionName: "Islami Bank Bangladesh", productType: "DPS", tenureMonths: 12, minAmount: 0, interestRatePct: 5.75, sourceUrl: "https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf" },
  { institutionName: "Islami Bank Bangladesh", productType: "DPS", tenureMonths: 24, minAmount: 0, interestRatePct: 6.0, sourceUrl: "https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf" },
  { institutionName: "Islami Bank Bangladesh", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 6.75, sourceUrl: "https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf" },
  { institutionName: "Islami Bank Bangladesh", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 7.25, sourceUrl: "https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf" },
  { institutionName: "Islami Bank Bangladesh", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 7.75, sourceUrl: "https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf" },

  // --- Dutch-Bangla Bank --- https://www.dutchbanglabank.com/depositsadv/term-deposit.html
  { institutionName: "Dutch-Bangla Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 7.0, sourceUrl: "https://www.dutchbanglabank.com/depositsadv/term-deposit.html" },
  { institutionName: "Dutch-Bangla Bank", productType: "FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 7.1, sourceUrl: "https://www.dutchbanglabank.com/depositsadv/term-deposit.html" },
  { institutionName: "Dutch-Bangla Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 7.2, sourceUrl: "https://www.dutchbanglabank.com/depositsadv/term-deposit.html" },
  { institutionName: "Dutch-Bangla Bank", productType: "FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 7.2, sourceUrl: "https://www.dutchbanglabank.com/depositsadv/term-deposit.html" },
  { institutionName: "Dutch-Bangla Bank", productType: "FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 7.2, sourceUrl: "https://www.dutchbanglabank.com/depositsadv/term-deposit.html" },
  { institutionName: "Dutch-Bangla Bank", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.dutchbanglabank.com/depositsadv/term-deposit.html" },
  { institutionName: "Dutch-Bangla Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.dutchbanglabank.com/depositsadv/term-deposit.html" },
  { institutionName: "Dutch-Bangla Bank", productType: "DPS", tenureMonths: 96, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.dutchbanglabank.com/depositsadv/term-deposit.html" },
  { institutionName: "Dutch-Bangla Bank", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.dutchbanglabank.com/depositsadv/term-deposit.html" },

  // --- BRAC Bank --- Retail Monthly Interest FD (FRABR) + FRFLX DPS. Updated
  // 2026-09-18 from ALCO Circular 2026/09 (effective Sep 13, 2026), found via
  // the PDF link on the bank's own deposit-interest-rate page rather than a
  // search result -- deliberately, because a prior check surfaced a
  // search-cached URL whose filename said 2026 but whose contents were the
  // year-old 2025/05 circular. Real drift in both products since the Aug 25
  // (2026/07) sheet:
  //   FRABR fell 0.50pp at every tenure: 6mo 8.00%->7.50%, 12-84mo
  //   8.25%->7.75%. Published tenures unchanged: 6/12/14/18/24/36/60/84mo.
  { institutionName: "BRAC Bank", productType: "FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 7.5, sourceUrl: "https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_13.09.20266aa159b705cdd.pdf" },
  { institutionName: "BRAC Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 7.75, sourceUrl: "https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_13.09.20266aa159b705cdd.pdf" },
  { institutionName: "BRAC Bank", productType: "FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 7.75, sourceUrl: "https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_13.09.20266aa159b705cdd.pdf" },
  { institutionName: "BRAC Bank", productType: "FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 7.75, sourceUrl: "https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_13.09.20266aa159b705cdd.pdf" },
  { institutionName: "BRAC Bank", productType: "FDR", tenureMonths: 60, minAmount: 0, interestRatePct: 7.75, sourceUrl: "https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_13.09.20266aa159b705cdd.pdf" },
  { institutionName: "BRAC Bank", productType: "FDR", tenureMonths: 84, minAmount: 0, interestRatePct: 7.75, sourceUrl: "https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_13.09.20266aa159b705cdd.pdf" },
  // FRFLX DPS is banded by completed year, not tenure-locked. Its SHAPE changed
  // in this circular, not just its values: previously Yr1 8.50%, Yr2 8.75%, then
  // flat 9.00% from Yr3 on; now a rising ladder that only reaches its old
  // starting point at Yr5 -- Yr1 7.00%, Yr2 7.25%, Yr3 7.50%, Yr4 7.75%,
  // Yr5-9 8.00%, Yr10 8.25%. The stored tenures map onto it one-for-one.
  { institutionName: "BRAC Bank", productType: "DPS", tenureMonths: 12, minAmount: 0, interestRatePct: 7.0, sourceUrl: "https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_13.09.20266aa159b705cdd.pdf" },
  { institutionName: "BRAC Bank", productType: "DPS", tenureMonths: 24, minAmount: 0, interestRatePct: 7.25, sourceUrl: "https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_13.09.20266aa159b705cdd.pdf" },
  { institutionName: "BRAC Bank", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 7.5, sourceUrl: "https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_13.09.20266aa159b705cdd.pdf" },
  { institutionName: "BRAC Bank", productType: "DPS", tenureMonths: 48, minAmount: 0, interestRatePct: 7.75, sourceUrl: "https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_13.09.20266aa159b705cdd.pdf" },
  { institutionName: "BRAC Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_13.09.20266aa159b705cdd.pdf" },
  { institutionName: "BRAC Bank", productType: "DPS", tenureMonths: 84, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_13.09.20266aa159b705cdd.pdf" },
  { institutionName: "BRAC Bank", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_13.09.20266aa159b705cdd.pdf" },

  // --- Eastern Bank (EBL) --- standard FD (tiered) + EBL Confidence DPS
  { institutionName: "Eastern Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 6.35, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },
  { institutionName: "Eastern Bank", productType: "FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 6.5, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },
  { institutionName: "Eastern Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 6.5, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },
  { institutionName: "Eastern Bank", productType: "FDR", tenureMonths: 24, minAmount: 0, maxAmount: 1 * CRORE, interestRatePct: 7.25, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },
  { institutionName: "Eastern Bank", productType: "FDR", tenureMonths: 24, minAmount: 1 * CRORE, maxAmount: 5 * CRORE, interestRatePct: 7.5, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },
  { institutionName: "Eastern Bank", productType: "FDR", tenureMonths: 24, minAmount: 5 * CRORE, interestRatePct: 7.75, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },
  { institutionName: "Eastern Bank", productType: "FDR", tenureMonths: 36, minAmount: 0, maxAmount: 1 * CRORE, interestRatePct: 7.25, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },
  { institutionName: "Eastern Bank", productType: "FDR", tenureMonths: 36, minAmount: 1 * CRORE, maxAmount: 5 * CRORE, interestRatePct: 7.5, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },
  { institutionName: "Eastern Bank", productType: "FDR", tenureMonths: 36, minAmount: 5 * CRORE, interestRatePct: 7.75, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },
  // EBL Confidence DPS: 9.00% through year 6 (72mo), 8.75% from year 7 (84mo) onward, to 15yr
  { institutionName: "Eastern Bank", productType: "DPS", tenureMonths: 12, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },
  { institutionName: "Eastern Bank", productType: "DPS", tenureMonths: 24, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },
  { institutionName: "Eastern Bank", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },
  { institutionName: "Eastern Bank", productType: "DPS", tenureMonths: 48, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },
  { institutionName: "Eastern Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },
  { institutionName: "Eastern Bank", productType: "DPS", tenureMonths: 72, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },
  { institutionName: "Eastern Bank", productType: "DPS", tenureMonths: 84, minAmount: 0, interestRatePct: 8.75, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },
  { institutionName: "Eastern Bank", productType: "DPS", tenureMonths: 96, minAmount: 0, interestRatePct: 8.75, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },
  { institutionName: "Eastern Bank", productType: "DPS", tenureMonths: 108, minAmount: 0, interestRatePct: 8.75, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },
  { institutionName: "Eastern Bank", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 8.75, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },
  { institutionName: "Eastern Bank", productType: "DPS", tenureMonths: 144, minAmount: 0, interestRatePct: 8.75, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },
  { institutionName: "Eastern Bank", productType: "DPS", tenureMonths: 168, minAmount: 0, interestRatePct: 8.75, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },
  { institutionName: "Eastern Bank", productType: "DPS", tenureMonths: 180, minAmount: 0, interestRatePct: 8.75, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },

  // --- Prime Bank --- Prime Fixed Deposit (capped at 36mo, confirmed) + Prime Kotipoti DPS
  { institutionName: "Prime Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 7.0, sourceUrl: "https://www.primebank.com.bd/interest-or-profit-rates" },
  { institutionName: "Prime Bank", productType: "FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 8.75, sourceUrl: "https://www.primebank.com.bd/interest-or-profit-rates" },
  { institutionName: "Prime Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.primebank.com.bd/interest-or-profit-rates" },
  { institutionName: "Prime Bank", productType: "FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://www.primebank.com.bd/interest-or-profit-rates" },
  { institutionName: "Prime Bank", productType: "FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://www.primebank.com.bd/interest-or-profit-rates" },
  // Prime Kotipoti DPS: exact published tenure set confirmed as 60/84/120/144/180mo only
  // (36/48/240mo explicitly marked "not offered" on the source) — all flat 9.00%
  { institutionName: "Prime Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.primebank.com.bd/interest-or-profit-rates" },
  { institutionName: "Prime Bank", productType: "DPS", tenureMonths: 84, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.primebank.com.bd/interest-or-profit-rates" },
  { institutionName: "Prime Bank", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.primebank.com.bd/interest-or-profit-rates" },
  { institutionName: "Prime Bank", productType: "DPS", tenureMonths: 144, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.primebank.com.bd/interest-or-profit-rates" },
  { institutionName: "Prime Bank", productType: "DPS", tenureMonths: 180, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.primebank.com.bd/interest-or-profit-rates" },

  // --- Dhaka Bank --- Special FD (SME/Corp) tenures
  // Switched from "Special FD" (capped at 12mo) to "Regular Fixed Deposit" — the
  // more representative general-public product, and it extends to 24mo. Confirmed
  // via re-audit that NO Dhaka Bank FDR product (Regular/Plus/Senior/Aroni/Obiram/
  // Corporate Supreme) exceeds 24 months — 24mo is the genuine ceiling.
  { institutionName: "Dhaka Bank", productType: "FDR", tenureMonths: 1, minAmount: 0, interestRatePct: 4.0, sourceUrl: "https://dhakabank.com.bd/wp-content/uploads/2026/09/Deposit-Rate-Effective-from-Sep-16-2026.pdf" },
  { institutionName: "Dhaka Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 7.75, sourceUrl: "https://dhakabank.com.bd/wp-content/uploads/2026/09/Deposit-Rate-Effective-from-Sep-16-2026.pdf" },
  { institutionName: "Dhaka Bank", productType: "FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://dhakabank.com.bd/wp-content/uploads/2026/09/Deposit-Rate-Effective-from-Sep-16-2026.pdf" },
  { institutionName: "Dhaka Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://dhakabank.com.bd/wp-content/uploads/2026/09/Deposit-Rate-Effective-from-Sep-16-2026.pdf" },
  { institutionName: "Dhaka Bank", productType: "FDR", tenureMonths: 18, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://dhakabank.com.bd/wp-content/uploads/2026/09/Deposit-Rate-Effective-from-Sep-16-2026.pdf" },
  { institutionName: "Dhaka Bank", productType: "FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://dhakabank.com.bd/wp-content/uploads/2026/09/Deposit-Rate-Effective-from-Sep-16-2026.pdf" },
  // Dhaka Bank DPS: the bank only publishes a maturity-VALUE chart (no percentage
  // rate anywhere), so these rates were back-solved from that chart — found the
  // rate R (monthly-compounded annuity, i=R/12) that makes our own maturity formula
  // exactly reproduce the bank's published maturity amount at every tenure AND at
  // three different monthly-deposit amounts (500/1000/25000), which matched
  // perfectly (confirming no amount-based tiering). Dhaka Bank's DPS product's
  // `compounding` field is set to MONTHLY below to match this derivation exactly.
  { institutionName: "Dhaka Bank", productType: "DPS", tenureMonths: 24, minAmount: 0, interestRatePct: 9.443, sourceUrl: "dhaka-bank-dps-maturity-chart (user-supplied image, back-solved)" },
  { institutionName: "Dhaka Bank", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 9.164, sourceUrl: "dhaka-bank-dps-maturity-chart (user-supplied image, back-solved)" },
  { institutionName: "Dhaka Bank", productType: "DPS", tenureMonths: 48, minAmount: 0, interestRatePct: 9.027, sourceUrl: "dhaka-bank-dps-maturity-chart (user-supplied image, back-solved)" },
  { institutionName: "Dhaka Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 9.898, sourceUrl: "dhaka-bank-dps-maturity-chart (user-supplied image, back-solved)" },
  { institutionName: "Dhaka Bank", productType: "DPS", tenureMonths: 72, minAmount: 0, interestRatePct: 9.367, sourceUrl: "dhaka-bank-dps-maturity-chart (user-supplied image, back-solved)" },
  { institutionName: "Dhaka Bank", productType: "DPS", tenureMonths: 84, minAmount: 0, interestRatePct: 8.855, sourceUrl: "dhaka-bank-dps-maturity-chart (user-supplied image, back-solved)" },
  { institutionName: "Dhaka Bank", productType: "DPS", tenureMonths: 96, minAmount: 0, interestRatePct: 8.591, sourceUrl: "dhaka-bank-dps-maturity-chart (user-supplied image, back-solved)" },
  { institutionName: "Dhaka Bank", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 8.317, sourceUrl: "dhaka-bank-dps-maturity-chart (user-supplied image, back-solved)" },

  // --- Pubali Bank --- FDR ladder + Pubali Pension Scheme (PPS) DPS-equivalent
  // Source: official rate sheet PDF supplied directly (research/pubali_bank_rate.pdf)
  { institutionName: "Pubali Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 8.0, sourceUrl: "research/pubali_bank_rate.pdf (official rate sheet)" },
  { institutionName: "Pubali Bank", productType: "FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 8.25, sourceUrl: "research/pubali_bank_rate.pdf (official rate sheet)" },
  { institutionName: "Pubali Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 8.5, sourceUrl: "research/pubali_bank_rate.pdf (official rate sheet)" },
  { institutionName: "Pubali Bank", productType: "FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 8.5, sourceUrl: "research/pubali_bank_rate.pdf (official rate sheet)" },
  { institutionName: "Pubali Bank", productType: "FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 8.5, sourceUrl: "research/pubali_bank_rate.pdf (official rate sheet)" },
  // Pubali Pension Scheme (PPS), pegged to "1 Year FDR Rate" = 8.50% at every tenure
  { institutionName: "Pubali Bank", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 8.5, sourceUrl: "research/pubali_bank_rate.pdf (official rate sheet)" },
  { institutionName: "Pubali Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 8.5, sourceUrl: "research/pubali_bank_rate.pdf (official rate sheet)" },
  { institutionName: "Pubali Bank", productType: "DPS", tenureMonths: 84, minAmount: 0, interestRatePct: 8.5, sourceUrl: "research/pubali_bank_rate.pdf (official rate sheet)" },
  { institutionName: "Pubali Bank", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 8.5, sourceUrl: "research/pubali_bank_rate.pdf (official rate sheet)" },

  // --- NCC Bank --- base FDR (tiered) + Kotipoti/Millionaire DPS (2025 sheet, fresher than the stale 2020 SSS sheet)
  { institutionName: "NCC Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, maxAmount: 50 * LAC, interestRatePct: 9.0, sourceUrl: "https://www.nccbank.com.bd/assets/files/rates_files/Deposit_Rates.pdf" },
  { institutionName: "NCC Bank", productType: "FDR", tenureMonths: 3, minAmount: 50 * LAC, maxAmount: 1 * CRORE, interestRatePct: 9.25, sourceUrl: "https://www.nccbank.com.bd/assets/files/rates_files/Deposit_Rates.pdf" },
  { institutionName: "NCC Bank", productType: "FDR", tenureMonths: 3, minAmount: 1 * CRORE, maxAmount: 5 * CRORE, interestRatePct: 9.5, sourceUrl: "https://www.nccbank.com.bd/assets/files/rates_files/Deposit_Rates.pdf" },
  { institutionName: "NCC Bank", productType: "FDR", tenureMonths: 3, minAmount: 5 * CRORE, interestRatePct: 9.75, sourceUrl: "https://www.nccbank.com.bd/assets/files/rates_files/Deposit_Rates.pdf" },
  { institutionName: "NCC Bank", productType: "FDR", tenureMonths: 6, minAmount: 0, maxAmount: 50 * LAC, interestRatePct: 9.25, sourceUrl: "https://www.nccbank.com.bd/assets/files/rates_files/Deposit_Rates.pdf" },
  { institutionName: "NCC Bank", productType: "FDR", tenureMonths: 6, minAmount: 50 * LAC, maxAmount: 1 * CRORE, interestRatePct: 9.5, sourceUrl: "https://www.nccbank.com.bd/assets/files/rates_files/Deposit_Rates.pdf" },
  { institutionName: "NCC Bank", productType: "FDR", tenureMonths: 6, minAmount: 1 * CRORE, maxAmount: 5 * CRORE, interestRatePct: 9.75, sourceUrl: "https://www.nccbank.com.bd/assets/files/rates_files/Deposit_Rates.pdf" },
  { institutionName: "NCC Bank", productType: "FDR", tenureMonths: 6, minAmount: 5 * CRORE, interestRatePct: 10.0, sourceUrl: "https://www.nccbank.com.bd/assets/files/rates_files/Deposit_Rates.pdf" },
  { institutionName: "NCC Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, maxAmount: 50 * LAC, interestRatePct: 9.5, sourceUrl: "https://www.nccbank.com.bd/assets/files/rates_files/Deposit_Rates.pdf" },
  { institutionName: "NCC Bank", productType: "FDR", tenureMonths: 12, minAmount: 50 * LAC, maxAmount: 1 * CRORE, interestRatePct: 9.75, sourceUrl: "https://www.nccbank.com.bd/assets/files/rates_files/Deposit_Rates.pdf" },
  { institutionName: "NCC Bank", productType: "FDR", tenureMonths: 12, minAmount: 1 * CRORE, maxAmount: 5 * CRORE, interestRatePct: 10.0, sourceUrl: "https://www.nccbank.com.bd/assets/files/rates_files/Deposit_Rates.pdf" },
  { institutionName: "NCC Bank", productType: "FDR", tenureMonths: 12, minAmount: 5 * CRORE, interestRatePct: 10.25, sourceUrl: "https://www.nccbank.com.bd/assets/files/rates_files/Deposit_Rates.pdf" },
  // Kotipoti/Millionaire Scheme: confirmed full tenure list is 2/3/4/5/10/15/20yr, flat 10.00%
  { institutionName: "NCC Bank", productType: "DPS", tenureMonths: 24, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.nccbank.com.bd/assets/files/rates_files/Deposit_Rates.pdf" },
  { institutionName: "NCC Bank", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.nccbank.com.bd/assets/files/rates_files/Deposit_Rates.pdf" },
  { institutionName: "NCC Bank", productType: "DPS", tenureMonths: 48, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.nccbank.com.bd/assets/files/rates_files/Deposit_Rates.pdf" },
  { institutionName: "NCC Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.nccbank.com.bd/assets/files/rates_files/Deposit_Rates.pdf" },
  { institutionName: "NCC Bank", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.nccbank.com.bd/assets/files/rates_files/Deposit_Rates.pdf" },
  { institutionName: "NCC Bank", productType: "DPS", tenureMonths: 180, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.nccbank.com.bd/assets/files/rates_files/Deposit_Rates.pdf" },
  { institutionName: "NCC Bank", productType: "DPS", tenureMonths: 240, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.nccbank.com.bd/assets/files/rates_files/Deposit_Rates.pdf" },

  // --- Bank Asia --- FDR ladder + DPS+ (flagship DPS, from official brochure PDF)
  // Updated 2026-09-18 (sector-wide repricing around 15-Sep-2026): every
  // tenure fell, and the page is now amount-tiered (below Tk 1 Cr / Tk 1 Cr &
  // above) where the stored data was untiered -- both bands captured below.
  { institutionName: "Bank Asia", productType: "FDR", tenureMonths: 3, minAmount: 0, maxAmount: 1 * CRORE, interestRatePct: 7.0, sourceUrl: "https://www.bankasia-bd.com/other/interestrates" },
  { institutionName: "Bank Asia", productType: "FDR", tenureMonths: 3, minAmount: 1 * CRORE, interestRatePct: 7.5, sourceUrl: "https://www.bankasia-bd.com/other/interestrates" },
  { institutionName: "Bank Asia", productType: "FDR", tenureMonths: 6, minAmount: 0, maxAmount: 1 * CRORE, interestRatePct: 7.0, sourceUrl: "https://www.bankasia-bd.com/other/interestrates" },
  { institutionName: "Bank Asia", productType: "FDR", tenureMonths: 6, minAmount: 1 * CRORE, interestRatePct: 7.5, sourceUrl: "https://www.bankasia-bd.com/other/interestrates" },
  { institutionName: "Bank Asia", productType: "FDR", tenureMonths: 12, minAmount: 0, maxAmount: 1 * CRORE, interestRatePct: 7.5, sourceUrl: "https://www.bankasia-bd.com/other/interestrates" },
  { institutionName: "Bank Asia", productType: "FDR", tenureMonths: 12, minAmount: 1 * CRORE, interestRatePct: 7.75, sourceUrl: "https://www.bankasia-bd.com/other/interestrates" },
  { institutionName: "Bank Asia", productType: "FDR", tenureMonths: 24, minAmount: 0, maxAmount: 1 * CRORE, interestRatePct: 7.5, sourceUrl: "https://www.bankasia-bd.com/other/interestrates" },
  { institutionName: "Bank Asia", productType: "FDR", tenureMonths: 24, minAmount: 1 * CRORE, interestRatePct: 7.75, sourceUrl: "https://www.bankasia-bd.com/other/interestrates" },
  { institutionName: "Bank Asia", productType: "FDR", tenureMonths: 36, minAmount: 0, maxAmount: 1 * CRORE, interestRatePct: 7.5, sourceUrl: "https://www.bankasia-bd.com/other/interestrates" },
  { institutionName: "Bank Asia", productType: "FDR", tenureMonths: 36, minAmount: 1 * CRORE, interestRatePct: 7.75, sourceUrl: "https://www.bankasia-bd.com/other/interestrates" },
  // DPS+ (ডিপিএস+), effective from 01 Feb 2026 per the brochure
  { institutionName: "Bank Asia", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 9.81, sourceUrl: "https://www.bankasia-bd.com/downloads/Bank_Asia_DPS_Brochure.pdf" },
  { institutionName: "Bank Asia", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 9.96, sourceUrl: "https://www.bankasia-bd.com/downloads/Bank_Asia_DPS_Brochure.pdf" },
  { institutionName: "Bank Asia", productType: "DPS", tenureMonths: 84, minAmount: 0, interestRatePct: 9.15, sourceUrl: "https://www.bankasia-bd.com/downloads/Bank_Asia_DPS_Brochure.pdf" },
  { institutionName: "Bank Asia", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 9.27, sourceUrl: "https://www.bankasia-bd.com/downloads/Bank_Asia_DPS_Brochure.pdf" },
  { institutionName: "Bank Asia", productType: "DPS", tenureMonths: 144, minAmount: 0, interestRatePct: 9.34, sourceUrl: "https://www.bankasia-bd.com/downloads/Bank_Asia_DPS_Brochure.pdf" },

  // --- Trust Bank --- base FDR (tiered) + Trust Smart Savers DPS
  // Updated 2026-09-18. The old URL (/rates-and-charges/deposit-rates) now
  // 404s; the live page is https://www.tblbd.com/rates/. Part of the
  // sector-wide repricing around 15-Sep-2026: the Individuals FDR table fell
  // 0.75pp at every tier and every tenure (3/6/12mo all share one rate per
  // amount band), read directly off the live table.
  { institutionName: "Trust Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, maxAmount: 50 * LAC, interestRatePct: 7.0, sourceUrl: "https://www.tblbd.com/rates/" },
  { institutionName: "Trust Bank", productType: "FDR", tenureMonths: 3, minAmount: 50 * LAC, maxAmount: 1 * CRORE, interestRatePct: 7.25, sourceUrl: "https://www.tblbd.com/rates/" },
  { institutionName: "Trust Bank", productType: "FDR", tenureMonths: 3, minAmount: 1 * CRORE, maxAmount: 5 * CRORE, interestRatePct: 7.5, sourceUrl: "https://www.tblbd.com/rates/" },
  { institutionName: "Trust Bank", productType: "FDR", tenureMonths: 3, minAmount: 5 * CRORE, interestRatePct: 7.75, sourceUrl: "https://www.tblbd.com/rates/" },
  { institutionName: "Trust Bank", productType: "FDR", tenureMonths: 6, minAmount: 0, maxAmount: 50 * LAC, interestRatePct: 7.0, sourceUrl: "https://www.tblbd.com/rates/" },
  { institutionName: "Trust Bank", productType: "FDR", tenureMonths: 6, minAmount: 50 * LAC, maxAmount: 1 * CRORE, interestRatePct: 7.25, sourceUrl: "https://www.tblbd.com/rates/" },
  { institutionName: "Trust Bank", productType: "FDR", tenureMonths: 6, minAmount: 1 * CRORE, maxAmount: 5 * CRORE, interestRatePct: 7.5, sourceUrl: "https://www.tblbd.com/rates/" },
  { institutionName: "Trust Bank", productType: "FDR", tenureMonths: 6, minAmount: 5 * CRORE, interestRatePct: 7.75, sourceUrl: "https://www.tblbd.com/rates/" },
  { institutionName: "Trust Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, maxAmount: 50 * LAC, interestRatePct: 7.0, sourceUrl: "https://www.tblbd.com/rates/" },
  { institutionName: "Trust Bank", productType: "FDR", tenureMonths: 12, minAmount: 50 * LAC, maxAmount: 1 * CRORE, interestRatePct: 7.25, sourceUrl: "https://www.tblbd.com/rates/" },
  { institutionName: "Trust Bank", productType: "FDR", tenureMonths: 12, minAmount: 1 * CRORE, maxAmount: 5 * CRORE, interestRatePct: 7.5, sourceUrl: "https://www.tblbd.com/rates/" },
  { institutionName: "Trust Bank", productType: "FDR", tenureMonths: 12, minAmount: 5 * CRORE, interestRatePct: 7.75, sourceUrl: "https://www.tblbd.com/rates/" },
  // Conventional DPS entries REMOVED 2026-09-18. They carried 9.50% at
  // 36/60/84/120mo sourced to the old deposit-rates URL, but that page is gone
  // and the current /rates/ page publishes no DPS rate table at all -- only a
  // "Trust Student DPS" product link with no figures (verified by reading the
  // live page, not inferred). Rather than keep four unsourceable numbers on a
  // public comparison site, the product is left as a shell, consistent with how
  // every other unpublished rate in this file is handled. Re-add if Trust Bank
  // publishes a DPS rate table again.

  // --- Southeast Bank --- Retail FDR (tiered) + Shohoz DPS. Updated 2026-09-18
  // from the current sheet ("Interest/Profit Rate of Deposit Products", Last
  // Updated September 01, 2026). The old dated URL (...-June-07-2026.pdf) now
  // 404s; the bank switched to an UNDATED, stable filename, so the content now
  // changes silently under a fixed URL -- future checks must compare the "Last
  // Updated" line printed on every page, not the filename.
  //   Note on how the dead link presented: a plain automated GET returned
  //   HTTP 200 with a 245-byte "Request Rejected" WAF page, which naive
  //   liveness checks read as healthy. Only with full browser headers does it
  //   resolve to a true 404. Treat a suspiciously tiny 200 from this host as a
  //   block, not a success.
  // The FDR tier STRUCTURE changed: the June sheet had five amount bands
  // (10L/50L/1cr/5cr breakpoints); the September sheet publishes three
  // (<50 lac / 50-150 lac / 150 lac+). Base-tier rates are unchanged, but the
  // old upper bands (8.75/9.25/9.5/9.75) no longer exist as published rates,
  // so they are replaced rather than carried forward.
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, maxAmount: 50 * LAC, interestRatePct: 8.0, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC.pdf" },
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 3, minAmount: 50 * LAC, maxAmount: 150 * LAC, interestRatePct: 8.25, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC.pdf" },
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 3, minAmount: 150 * LAC, interestRatePct: 8.75, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC.pdf" },
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 6, minAmount: 0, maxAmount: 50 * LAC, interestRatePct: 8.0, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC.pdf" },
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 6, minAmount: 50 * LAC, maxAmount: 150 * LAC, interestRatePct: 8.25, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC.pdf" },
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 6, minAmount: 150 * LAC, interestRatePct: 8.75, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC.pdf" },
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, maxAmount: 50 * LAC, interestRatePct: 8.25, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC.pdf" },
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 12, minAmount: 50 * LAC, maxAmount: 150 * LAC, interestRatePct: 8.5, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC.pdf" },
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 12, minAmount: 150 * LAC, interestRatePct: 9.0, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC.pdf" },
  // 18mo/24mo/36mo now published too (the June sheet's captured range stopped
  // at 12mo); 24 & 36mo share the same band rates.
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 18, minAmount: 0, maxAmount: 50 * LAC, interestRatePct: 8.0, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC.pdf" },
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 24, minAmount: 0, maxAmount: 50 * LAC, interestRatePct: 8.0, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC.pdf" },
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 36, minAmount: 0, maxAmount: 50 * LAC, interestRatePct: 8.0, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC.pdf" },
  // Shohoz DPS effective rates — re-read from the September sheet and
  // confirmed unchanged from the June figures.
  { institutionName: "Southeast Bank", productType: "DPS", tenureMonths: 24, minAmount: 0, interestRatePct: 9.9248, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC.pdf" },
  { institutionName: "Southeast Bank", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 9.3807, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC.pdf" },
  { institutionName: "Southeast Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 9.1096, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC.pdf" },
  { institutionName: "Southeast Bank", productType: "DPS", tenureMonths: 84, minAmount: 0, interestRatePct: 8.8391, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC.pdf" },
  { institutionName: "Southeast Bank", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 8.5692, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC.pdf" },

  // --- IFIC Bank --- Term Deposit (tiered) + Aamar Bhobishawt DPS
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 1, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1789540414_IFIC%20Bank%20Latest%20Deposit__07.09.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, maxAmount: 1 * LAC, interestRatePct: 9.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1789540414_IFIC%20Bank%20Latest%20Deposit__07.09.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 3, minAmount: 1 * LAC, maxAmount: 5 * LAC, interestRatePct: 9.5, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1789540414_IFIC%20Bank%20Latest%20Deposit__07.09.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 3, minAmount: 5 * LAC, maxAmount: 20 * LAC, interestRatePct: 9.5, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1789540414_IFIC%20Bank%20Latest%20Deposit__07.09.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 3, minAmount: 20 * LAC, maxAmount: 50 * LAC, interestRatePct: 9.75, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1789540414_IFIC%20Bank%20Latest%20Deposit__07.09.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 3, minAmount: 50 * LAC, interestRatePct: 10.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1789540414_IFIC%20Bank%20Latest%20Deposit__07.09.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 6, minAmount: 0, maxAmount: 1 * LAC, interestRatePct: 9.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1789540414_IFIC%20Bank%20Latest%20Deposit__07.09.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 6, minAmount: 1 * LAC, maxAmount: 5 * LAC, interestRatePct: 9.5, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1789540414_IFIC%20Bank%20Latest%20Deposit__07.09.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 6, minAmount: 5 * LAC, maxAmount: 20 * LAC, interestRatePct: 9.75, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1789540414_IFIC%20Bank%20Latest%20Deposit__07.09.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 6, minAmount: 20 * LAC, interestRatePct: 10.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1789540414_IFIC%20Bank%20Latest%20Deposit__07.09.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, maxAmount: 1 * LAC, interestRatePct: 9.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1789540414_IFIC%20Bank%20Latest%20Deposit__07.09.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 12, minAmount: 1 * LAC, maxAmount: 5 * LAC, interestRatePct: 9.5, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1789540414_IFIC%20Bank%20Latest%20Deposit__07.09.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 12, minAmount: 5 * LAC, interestRatePct: 10.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1789540414_IFIC%20Bank%20Latest%20Deposit__07.09.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 24, minAmount: 0, maxAmount: 1 * LAC, interestRatePct: 9.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1789540414_IFIC%20Bank%20Latest%20Deposit__07.09.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 24, minAmount: 1 * LAC, maxAmount: 5 * LAC, interestRatePct: 9.5, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1789540414_IFIC%20Bank%20Latest%20Deposit__07.09.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 24, minAmount: 5 * LAC, interestRatePct: 10.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1789540414_IFIC%20Bank%20Latest%20Deposit__07.09.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 36, minAmount: 0, maxAmount: 1 * LAC, interestRatePct: 9.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1789540414_IFIC%20Bank%20Latest%20Deposit__07.09.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 36, minAmount: 1 * LAC, maxAmount: 5 * LAC, interestRatePct: 9.5, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1789540414_IFIC%20Bank%20Latest%20Deposit__07.09.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 36, minAmount: 5 * LAC, interestRatePct: 10.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1789540414_IFIC%20Bank%20Latest%20Deposit__07.09.2026.pdf" },
  // Re-verified 2026-09-18 against IFIC's current sheet (W.E.F. 07.09.2026;
  // the 16.08.2026 file 404s). All FDR tiers above CONFIRMED UNCHANGED.
  //   Open question on these DPS rows, flagged rather than silently "fixed":
  //   the sheet has no tenure-keyed DPS table. Its "Deposit Scheme" section
  //   lists only IFIC Aamar Bhobishawt at 10.00% and Pension Savings Scheme
  //   (PSS) at 9.50%. The stored 10.00% matches Aamar Bhobishawt, so it is
  //   left as-is; but if these rows were ever meant to track PSS, the right
  //   figure is 9.50%. Worth confirming which product the app intends here.
  //   Fetch note: ificbank.com.bd sits behind a botguard/captcha wall and
  //   returns text/html for .pdf paths to plain automated requests.
  { institutionName: "IFIC Bank", productType: "DPS", tenureMonths: 12, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1789540414_IFIC%20Bank%20Latest%20Deposit__07.09.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1789540414_IFIC%20Bank%20Latest%20Deposit__07.09.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1789540414_IFIC%20Bank%20Latest%20Deposit__07.09.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1789540414_IFIC%20Bank%20Latest%20Deposit__07.09.2026.pdf" },

  // --- United Commercial Bank (UCB) --- re-verified 2026-09-11 against
  // UCB's current conventional rate sheet (dated Sep 1, 2026, superseding
  // the prior circular #1632-only file). Numbers UNCHANGED from the last
  // check: Earning Plus FD (Regular, Quarterly payout, prefix 3428) 1-3yr
  // still 9.50% (4-10yr still 8.25%); Super Flex DPS (Regular group,
  // prefixes 3550/3580/3581/3582) still 9.50%/9.75%/10.00%/10.00% —
  // only the source URL/filename changed, updated below for traceability.
  { institutionName: "United Commercial Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/instruction-circular-no1632-1633full-deposit-productsuc.pdf" },
  { institutionName: "United Commercial Bank", productType: "FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/instruction-circular-no1632-1633full-deposit-productsuc.pdf" },
  { institutionName: "United Commercial Bank", productType: "FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/instruction-circular-no1632-1633full-deposit-productsuc.pdf" },
  { institutionName: "United Commercial Bank", productType: "FDR", tenureMonths: 48, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/instruction-circular-no1632-1633full-deposit-productsuc.pdf" },
  { institutionName: "United Commercial Bank", productType: "FDR", tenureMonths: 60, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/instruction-circular-no1632-1633full-deposit-productsuc.pdf" },
  { institutionName: "United Commercial Bank", productType: "FDR", tenureMonths: 84, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/instruction-circular-no1632-1633full-deposit-productsuc.pdf" },
  { institutionName: "United Commercial Bank", productType: "FDR", tenureMonths: 120, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/instruction-circular-no1632-1633full-deposit-productsuc.pdf" },
  { institutionName: "United Commercial Bank", productType: "DPS", tenureMonths: 12, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/instruction-circular-no1632-1633full-deposit-productsuc.pdf" },
  { institutionName: "United Commercial Bank", productType: "DPS", tenureMonths: 24, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/instruction-circular-no1632-1633full-deposit-productsuc.pdf" },
  { institutionName: "United Commercial Bank", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 9.75, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/instruction-circular-no1632-1633full-deposit-productsuc.pdf" },
  { institutionName: "United Commercial Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/instruction-circular-no1632-1633full-deposit-productsuc.pdf" },
  { institutionName: "United Commercial Bank", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/instruction-circular-no1632-1633full-deposit-productsuc.pdf" },

  // --- Jamuna Bank --- Monthly Savings Scheme DPS (from official "Deposit
  // Schemes" PDF, cross-validated at two deposit amounts per tenure — clean fit).
  // FDR/MTDR (the bank's base product) is NOT entered: it only publishes a
  // negotiated RANGE (7.00-11.00% for 3mo, 7.00-10.50% for 6/12mo), not a
  // specific advertised rate — same reasoning as Standard Chartered's exclusion.
  // "FD Freedom" is a SEPARATE, specific-rate product (user-supplied image,
  // day-count tenures mapped to the nearest month), tiered by amount:
  { institutionName: "Jamuna Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, maxAmount: 1 * CRORE, interestRatePct: 9.8, sourceUrl: "jamuna-bank-fd-freedom-table (user-supplied image)" },
  { institutionName: "Jamuna Bank", productType: "FDR", tenureMonths: 3, minAmount: 1 * CRORE, interestRatePct: 9.9, sourceUrl: "jamuna-bank-fd-freedom-table (user-supplied image)" },
  { institutionName: "Jamuna Bank", productType: "FDR", tenureMonths: 4, minAmount: 0, maxAmount: 1 * CRORE, interestRatePct: 9.7, sourceUrl: "jamuna-bank-fd-freedom-table (user-supplied image)" },
  { institutionName: "Jamuna Bank", productType: "FDR", tenureMonths: 4, minAmount: 1 * CRORE, interestRatePct: 9.8, sourceUrl: "jamuna-bank-fd-freedom-table (user-supplied image)" },
  { institutionName: "Jamuna Bank", productType: "FDR", tenureMonths: 6, minAmount: 0, maxAmount: 1 * CRORE, interestRatePct: 9.4, sourceUrl: "jamuna-bank-fd-freedom-table (user-supplied image)" },
  { institutionName: "Jamuna Bank", productType: "FDR", tenureMonths: 6, minAmount: 1 * CRORE, interestRatePct: 9.6, sourceUrl: "jamuna-bank-fd-freedom-table (user-supplied image)" },
  { institutionName: "Jamuna Bank", productType: "FDR", tenureMonths: 9, minAmount: 0, maxAmount: 1 * CRORE, interestRatePct: 9.35, sourceUrl: "jamuna-bank-fd-freedom-table (user-supplied image)" },
  { institutionName: "Jamuna Bank", productType: "FDR", tenureMonths: 9, minAmount: 1 * CRORE, interestRatePct: 9.5, sourceUrl: "jamuna-bank-fd-freedom-table (user-supplied image)" },
  { institutionName: "Jamuna Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, maxAmount: 1 * CRORE, interestRatePct: 9.3, sourceUrl: "jamuna-bank-fd-freedom-table (user-supplied image)" },
  { institutionName: "Jamuna Bank", productType: "FDR", tenureMonths: 12, minAmount: 1 * CRORE, interestRatePct: 9.4, sourceUrl: "jamuna-bank-fd-freedom-table (user-supplied image)" },
  // Updated 2026-09-18: the Aug PDF 404s; current sheet is
  // Jamuna_Bank_Deposit_Schemes_20260913.pdf (found via the bank's own rates
  // page). Caveat recorded deliberately: this PDF prints NO effective date
  // anywhere inside it, so the date rests on filename + server Last-Modified
  // (both 13-14 Sep 2026) rather than the usual printed-header standard.
  //   These rows track "Monthly Savings Scheme" (MSS), the monthly-installment
  //   product. Its published tenors are 3/5/8/10 years — there is no 7-year
  //   MSS tenor, so the former 84mo row has no source and is dropped rather
  //   than carried forward. (Jamuna does have a separate lump-sum Pension
  //   Deposit Scheme with a 7-year tenor at 9.50%, but that is a different
  //   product and mapping this row to it would silently change what the
  //   number means.)
  //   Extraction note: `pdftotext -layout` shifts this table's rate column by
  //   one row, which makes 3Y and 5Y both read 9.50%. The true alignment
  //   (confirmed by back-solving the printed maturity figures, and by -simple
  //   and -table modes agreeing) is 3Y 9.50%, 5Y 9.00%, 10Y 9.00%.
  { institutionName: "Jamuna Bank", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://jamunabankbd.com/wp-content/uploads/2026/09/Jamuna_Bank_Deposit_Schemes_20260913.pdf" },
  { institutionName: "Jamuna Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://jamunabankbd.com/wp-content/uploads/2026/09/Jamuna_Bank_Deposit_Schemes_20260913.pdf" },
  { institutionName: "Jamuna Bank", productType: "DPS", tenureMonths: 96, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://jamunabankbd.com/wp-content/uploads/2026/09/Jamuna_Bank_Deposit_Schemes_20260913.pdf" },
  { institutionName: "Jamuna Bank", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://jamunabankbd.com/wp-content/uploads/2026/09/Jamuna_Bank_Deposit_Schemes_20260913.pdf" },

  // --- Mutual Trust Bank --- base FDR (tiered) + Brick by Brick DPS
  { institutionName: "Mutual Trust Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, maxAmount: 50 * LAC, interestRatePct: 7.75, sourceUrl: "https://www.mutualtrustbank.com/interest-rates/" },
  { institutionName: "Mutual Trust Bank", productType: "FDR", tenureMonths: 3, minAmount: 50 * LAC, maxAmount: 1 * CRORE, interestRatePct: 8.0, sourceUrl: "https://www.mutualtrustbank.com/interest-rates/" },
  { institutionName: "Mutual Trust Bank", productType: "FDR", tenureMonths: 3, minAmount: 1 * CRORE, interestRatePct: 8.25, sourceUrl: "https://www.mutualtrustbank.com/interest-rates/" },
  { institutionName: "Mutual Trust Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, maxAmount: 50 * LAC, interestRatePct: 8.0, sourceUrl: "https://www.mutualtrustbank.com/interest-rates/" },
  { institutionName: "Mutual Trust Bank", productType: "FDR", tenureMonths: 12, minAmount: 50 * LAC, maxAmount: 1 * CRORE, interestRatePct: 8.25, sourceUrl: "https://www.mutualtrustbank.com/interest-rates/" },
  { institutionName: "Mutual Trust Bank", productType: "FDR", tenureMonths: 12, minAmount: 1 * CRORE, interestRatePct: 8.5, sourceUrl: "https://www.mutualtrustbank.com/interest-rates/" },
  { institutionName: "Mutual Trust Bank", productType: "FDR", tenureMonths: 24, minAmount: 0, maxAmount: 50 * LAC, interestRatePct: 8.0, sourceUrl: "https://www.mutualtrustbank.com/interest-rates/" },
  { institutionName: "Mutual Trust Bank", productType: "FDR", tenureMonths: 24, minAmount: 50 * LAC, interestRatePct: 8.25, sourceUrl: "https://www.mutualtrustbank.com/interest-rates/" },
  { institutionName: "Mutual Trust Bank", productType: "FDR", tenureMonths: 36, minAmount: 0, maxAmount: 50 * LAC, interestRatePct: 8.0, sourceUrl: "https://www.mutualtrustbank.com/interest-rates/" },
  { institutionName: "Mutual Trust Bank", productType: "FDR", tenureMonths: 36, minAmount: 50 * LAC, interestRatePct: 8.25, sourceUrl: "https://www.mutualtrustbank.com/interest-rates/" },
  { institutionName: "Mutual Trust Bank", productType: "DPS", tenureMonths: 12, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.mutualtrustbank.com/interest-rates/" },
  { institutionName: "Mutual Trust Bank", productType: "DPS", tenureMonths: 24, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.mutualtrustbank.com/interest-rates/" },
  { institutionName: "Mutual Trust Bank", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.mutualtrustbank.com/interest-rates/" },
  { institutionName: "Mutual Trust Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.mutualtrustbank.com/interest-rates/" },
  { institutionName: "Mutual Trust Bank", productType: "DPS", tenureMonths: 96, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.mutualtrustbank.com/interest-rates/" },
  { institutionName: "Mutual Trust Bank", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.mutualtrustbank.com/interest-rates/" },

  // --- Uttara Bank --- Standard FDR only; DPS skipped (MDS rate has no stated tenure)
  // Updated 2026-09-18. The page prints an effective date per row, and every
  // standard-FDR row now reads 15-Sep-2026 -- the same date Bank Asia, Trust
  // Bank and EBL repriced on, i.e. a sector-wide move, not a one-bank change.
  // Rates fell across the board: 3mo 8.50->7.50, 6mo 8.75->7.75, and the
  // "1 year to 5 years" band 9.00->8.00 (covers the 12/24/36mo rows).
  // Note: this host 403s a plain automated fetch but serves normally to a
  // browser User-Agent.
  { institutionName: "Uttara Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 7.5, sourceUrl: "https://www.uttarabank-bd.com/home/interestrate" },
  { institutionName: "Uttara Bank", productType: "FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 7.75, sourceUrl: "https://www.uttarabank-bd.com/home/interestrate" },
  { institutionName: "Uttara Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://www.uttarabank-bd.com/home/interestrate" },
  { institutionName: "Uttara Bank", productType: "FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://www.uttarabank-bd.com/home/interestrate" },
  { institutionName: "Uttara Bank", productType: "FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://www.uttarabank-bd.com/home/interestrate" },
  // Monthly Deposit Scheme (MDS): tenure (5/10yr) came from the dedicated product
  // page, rate (flat 10.00%, no per-tenure breakdown given) from the bank's rate
  // summary page — combining two of the bank's own official pages, not a guess.
  { institutionName: "Uttara Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.uttarabank-bd.com/index.php/home/depositproduct/5" },
  { institutionName: "Uttara Bank", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.uttarabank-bd.com/index.php/home/depositproduct/5" },

  // --- The City Bank --- fetched via rendering proxy (JS-only SPA, no static HTML); no effective date stated on page, verified live 2026-08-28.
  // FDR cross-checked 2026-08-29 against the same page's "Fixed Deposit" section —
  // deliberately NOT updated. That section lists dozens of near-identical tenures
  // (e.g. separate "90 Days", "91 Days", "92 Days"... "3 Months" rows) with
  // inconsistent, sometimes contradictory rates for what should be the same
  // period (e.g. "3 Months" at 6.15% vs "92 Days" at 8.00%), with no product-name
  // labels distinguishing them — reads like a live treasury booking export, not a
  // stable customer-facing rate card. Not confident enough in any single row to
  // treat it as the representative retail FDR rate, so the existing entries stand.
  { institutionName: "The City Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, maxAmount: 50 * LAC, interestRatePct: 8.0, sourceUrl: "https://www.citybankplc.com/gsi/conventional-banking-products" },
  { institutionName: "The City Bank", productType: "FDR", tenureMonths: 3, minAmount: 50 * LAC, maxAmount: 1 * CRORE, interestRatePct: 8.0, sourceUrl: "https://www.citybankplc.com/gsi/conventional-banking-products" },
  { institutionName: "The City Bank", productType: "FDR", tenureMonths: 3, minAmount: 1 * CRORE, maxAmount: 5 * CRORE, interestRatePct: 8.25, sourceUrl: "https://www.citybankplc.com/gsi/conventional-banking-products" },
  { institutionName: "The City Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, maxAmount: 1 * CRORE, interestRatePct: 8.25, sourceUrl: "https://www.citybankplc.com/gsi/conventional-banking-products" },
  { institutionName: "The City Bank", productType: "FDR", tenureMonths: 24, minAmount: 0, maxAmount: 1 * CRORE, interestRatePct: 8.25, sourceUrl: "https://www.citybankplc.com/gsi/conventional-banking-products" },
  { institutionName: "The City Bank", productType: "FDR", tenureMonths: 36, minAmount: 0, maxAmount: 1 * CRORE, interestRatePct: 8.25, sourceUrl: "https://www.citybankplc.com/gsi/conventional-banking-products" },
  // General DPS — re-confirmed 2026-08-29 as City Bank's "Goal Based DPS" under the
  // page's "Scheme Deposit" section (the only other clearly-named DPS product
  // besides Insurance-Backed, and its month-37 step lines up exactly with what was
  // already tracked here). Rate increased uniformly by 0.50 pts across every
  // bracket: 6-36mo 8.50% -> 9.00%, 37-120mo 9.00% -> 9.50%.
  // productNameHint required now that City Bank has 2 DPS products (see below).
  { institutionName: "The City Bank", productType: "DPS", productNameHint: "Deposit Pension Scheme", tenureMonths: 6, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.citybankplc.com/gsi/conventional-banking-products" },
  { institutionName: "The City Bank", productType: "DPS", productNameHint: "Deposit Pension Scheme", tenureMonths: 12, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.citybankplc.com/gsi/conventional-banking-products" },
  { institutionName: "The City Bank", productType: "DPS", productNameHint: "Deposit Pension Scheme", tenureMonths: 48, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.citybankplc.com/gsi/conventional-banking-products" },
  { institutionName: "The City Bank", productType: "DPS", productNameHint: "Deposit Pension Scheme", tenureMonths: 60, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.citybankplc.com/gsi/conventional-banking-products" },
  { institutionName: "The City Bank", productType: "DPS", productNameHint: "Deposit Pension Scheme", tenureMonths: 120, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.citybankplc.com/gsi/conventional-banking-products" },
  // Insurance-Backed DPS: distinct long-tenure product, individuals only, flat
  // 8.50% — re-confirmed unchanged 2026-08-29.
  { institutionName: "The City Bank", productType: "DPS", productNameHint: "Insurance-Backed", tenureMonths: 60, minAmount: 0, interestRatePct: 8.5, sourceUrl: "https://www.citybankplc.com/gsi/conventional-banking-products" },
  { institutionName: "The City Bank", productType: "DPS", productNameHint: "Insurance-Backed", tenureMonths: 120, minAmount: 0, interestRatePct: 8.5, sourceUrl: "https://www.citybankplc.com/gsi/conventional-banking-products" },
  { institutionName: "The City Bank", productType: "DPS", productNameHint: "Insurance-Backed", tenureMonths: 180, minAmount: 0, interestRatePct: 8.5, sourceUrl: "https://www.citybankplc.com/gsi/conventional-banking-products" },
  { institutionName: "The City Bank", productType: "DPS", productNameHint: "Insurance-Backed", tenureMonths: 240, minAmount: 0, interestRatePct: 8.5, sourceUrl: "https://www.citybankplc.com/gsi/conventional-banking-products" },

  // --- Government: Sanchayapatra family --- (news-corroborated official Finance Division rates)
  { institutionName: "Bangladesh Bank / National Savings Directorate", productType: "SANCHAYPATRO", productNameHint: "5-Year Bangladesh Sanchayapatra", tenureMonths: 60, minAmount: 0, maxAmount: 7.5 * LAC, interestRatePct: 11.83, sourceUrl: "https://www.dhakatribune.com/business/400262/govt-withdraws-new-savings-certificate-rates" },
  { institutionName: "Bangladesh Bank / National Savings Directorate", productType: "SANCHAYPATRO", productNameHint: "5-Year Bangladesh Sanchayapatra", tenureMonths: 60, minAmount: 7.5 * LAC, interestRatePct: 11.8, sourceUrl: "https://www.dhakatribune.com/business/400262/govt-withdraws-new-savings-certificate-rates" },
  { institutionName: "Bangladesh Bank / National Savings Directorate", productType: "SANCHAYPATRO", productNameHint: "Pensioner Sanchayapatra", tenureMonths: 60, minAmount: 0, maxAmount: 7.5 * LAC, interestRatePct: 11.98, sourceUrl: "https://www.dhakatribune.com/business/400262/govt-withdraws-new-savings-certificate-rates" },
  { institutionName: "Bangladesh Bank / National Savings Directorate", productType: "SANCHAYPATRO", productNameHint: "Pensioner Sanchayapatra", tenureMonths: 60, minAmount: 7.5 * LAC, interestRatePct: 11.8, sourceUrl: "https://www.dhakatribune.com/business/400262/govt-withdraws-new-savings-certificate-rates" },
  { institutionName: "Bangladesh Bank / National Savings Directorate", productType: "SANCHAYPATRO", productNameHint: "Poribar Sanchayapatra", tenureMonths: 60, minAmount: 0, maxAmount: 7.5 * LAC, interestRatePct: 11.93, sourceUrl: "https://www.dhakatribune.com/business/400262/govt-withdraws-new-savings-certificate-rates" },
  { institutionName: "Bangladesh Bank / National Savings Directorate", productType: "SANCHAYPATRO", productNameHint: "Poribar Sanchayapatra", tenureMonths: 60, minAmount: 7.5 * LAC, interestRatePct: 11.8, sourceUrl: "https://www.dhakatribune.com/business/400262/govt-withdraws-new-savings-certificate-rates" },
  // 3 Monthly Profit Bearing Sanchayapatra (pays profit quarterly), 3-year tenure
  { institutionName: "Bangladesh Bank / National Savings Directorate", productType: "SANCHAYPATRO", productNameHint: "3 Monthly Profit Bearing", tenureMonths: 36, minAmount: 0, maxAmount: 7.5 * LAC, interestRatePct: 11.82, sourceUrl: "https://www.dhakatribune.com/business/400262/govt-withdraws-new-savings-certificate-rates" },
  { institutionName: "Bangladesh Bank / National Savings Directorate", productType: "SANCHAYPATRO", productNameHint: "3 Monthly Profit Bearing", tenureMonths: 36, minAmount: 7.5 * LAC, interestRatePct: 11.77, sourceUrl: "https://www.dhakatribune.com/business/400262/govt-withdraws-new-savings-certificate-rates" },

  // --- Government: Treasury Bond (BGTB) --- Bangladesh Bank auction cut-off yields
  { institutionName: "Bangladesh Bank / National Savings Directorate", productType: "TBOND", tenureMonths: 24, minAmount: 0, interestRatePct: 9.39, sourceUrl: "https://www.bb.org.bd/en/index.php/monetaryactivity/treasury" },
  { institutionName: "Bangladesh Bank / National Savings Directorate", productType: "TBOND", tenureMonths: 36, minAmount: 0, interestRatePct: 9.9, sourceUrl: "https://www.bb.org.bd/en/index.php/monetaryactivity/treasury" },
  { institutionName: "Bangladesh Bank / National Savings Directorate", productType: "TBOND", tenureMonths: 60, minAmount: 0, interestRatePct: 9.3496, sourceUrl: "https://www.bb.org.bd/en/index.php/monetaryactivity/treasury" },
  { institutionName: "Bangladesh Bank / National Savings Directorate", productType: "TBOND", tenureMonths: 120, minAmount: 0, interestRatePct: 9.234, sourceUrl: "https://www.bb.org.bd/en/index.php/monetaryactivity/treasury" },
  { institutionName: "Bangladesh Bank / National Savings Directorate", productType: "TBOND", tenureMonths: 180, minAmount: 0, interestRatePct: 9.0975, sourceUrl: "https://www.bb.org.bd/en/index.php/monetaryactivity/treasury" },
  { institutionName: "Bangladesh Bank / National Savings Directorate", productType: "TBOND", tenureMonths: 240, minAmount: 0, interestRatePct: 9.1275, sourceUrl: "https://www.bb.org.bd/en/index.php/monetaryactivity/treasury" },

  // --- Government: Treasury Bill --- Bangladesh Bank auction cut-off yields (91/182/364-day ~= 3/6/12mo)
  { institutionName: "Bangladesh Bank / National Savings Directorate", productType: "TBILL", tenureMonths: 3, minAmount: 0, interestRatePct: 8.829, sourceUrl: "https://www.bb.org.bd/en/index.php/monetaryactivity/treasury" },
  { institutionName: "Bangladesh Bank / National Savings Directorate", productType: "TBILL", tenureMonths: 6, minAmount: 0, interestRatePct: 8.92, sourceUrl: "https://www.bb.org.bd/en/index.php/monetaryactivity/treasury" },
  { institutionName: "Bangladesh Bank / National Savings Directorate", productType: "TBILL", tenureMonths: 12, minAmount: 0, interestRatePct: 9.07, sourceUrl: "https://www.bb.org.bd/en/index.php/monetaryactivity/treasury" },

  // --- IPDC Finance Limited --- Extra Value FD + Deposit Premium/Millionaire/Ultiflex DPS
  { institutionName: "IPDC Finance Limited", productType: "FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://ipdc.com/assets/ipdc/downloads/forms/retail-deposit-products-rates.pdf" },
  { institutionName: "IPDC Finance Limited", productType: "FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 9.15, sourceUrl: "https://ipdc.com/assets/ipdc/downloads/forms/retail-deposit-products-rates.pdf" },
  { institutionName: "IPDC Finance Limited", productType: "FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 9.25, sourceUrl: "https://ipdc.com/assets/ipdc/downloads/forms/retail-deposit-products-rates.pdf" },
  { institutionName: "IPDC Finance Limited", productType: "FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 9.25, sourceUrl: "https://ipdc.com/assets/ipdc/downloads/forms/retail-deposit-products-rates.pdf" },
  { institutionName: "IPDC Finance Limited", productType: "FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 9.25, sourceUrl: "https://ipdc.com/assets/ipdc/downloads/forms/retail-deposit-products-rates.pdf" },
  { institutionName: "IPDC Finance Limited", productType: "FDR", tenureMonths: 60, minAmount: 0, interestRatePct: 9.25, sourceUrl: "https://ipdc.com/assets/ipdc/downloads/forms/retail-deposit-products-rates.pdf" },
  { institutionName: "IPDC Finance Limited", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 9.75, sourceUrl: "https://ipdc.com/assets/ipdc/downloads/forms/retail-deposit-products-rates.pdf" },
  { institutionName: "IPDC Finance Limited", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 9.75, sourceUrl: "https://ipdc.com/assets/ipdc/downloads/forms/retail-deposit-products-rates.pdf" },

  // --- IDLC Finance --- Regular Term Deposit + Offline DPS (found via r.jina.ai proxy, follow-up research 2026-08-28)
  { institutionName: "IDLC Finance", productType: "FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.idlc.com/term-deposit" },
  { institutionName: "IDLC Finance", productType: "FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 9.25, sourceUrl: "https://www.idlc.com/term-deposit" },
  { institutionName: "IDLC Finance", productType: "FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.idlc.com/term-deposit" },
  { institutionName: "IDLC Finance", productType: "FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.idlc.com/term-deposit" },
  { institutionName: "IDLC Finance", productType: "FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.idlc.com/term-deposit" },
  { institutionName: "IDLC Finance", productType: "DPS", tenureMonths: 24, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.idlc.com/term-deposit" },
  { institutionName: "IDLC Finance", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.idlc.com/term-deposit" },
  { institutionName: "IDLC Finance", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.idlc.com/term-deposit" },
  // Confirmed flat 9.00% across the whole published "2 to 25 years" range
  { institutionName: "IDLC Finance", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.idlc.com/term-deposit" },
  { institutionName: "IDLC Finance", productType: "DPS", tenureMonths: 300, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.idlc.com/term-deposit" },

  // --- LankaBangla Finance --- Earn First TDR + Money Builder DPS
  { institutionName: "LankaBangla Finance", productType: "FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.lankabangla.com/deposit-rates/" },
  { institutionName: "LankaBangla Finance", productType: "FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.lankabangla.com/deposit-rates/" },
  { institutionName: "LankaBangla Finance", productType: "FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 9.75, sourceUrl: "https://www.lankabangla.com/deposit-rates/" },
  { institutionName: "LankaBangla Finance", productType: "FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.lankabangla.com/deposit-rates/" },
  { institutionName: "LankaBangla Finance", productType: "FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.lankabangla.com/deposit-rates/" },
  { institutionName: "LankaBangla Finance", productType: "DPS", tenureMonths: 24, minAmount: 0, interestRatePct: 10.75, sourceUrl: "https://www.lankabangla.com/deposit-rates/" },
  { institutionName: "LankaBangla Finance", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 10.75, sourceUrl: "https://www.lankabangla.com/deposit-rates/" },
  { institutionName: "LankaBangla Finance", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 10.75, sourceUrl: "https://www.lankabangla.com/deposit-rates/" },
  { institutionName: "LankaBangla Finance", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 10.75, sourceUrl: "https://www.lankabangla.com/deposit-rates/" },

  // --- Prime NOW --- Prime Bank PLC's fully digital-only banking brand
  // (https://primenow.ai). "Now FD" and "Now Fixed DPS" are the two
  // tenure-based products, sourced 2026-08-30 from the live rate page
  // (effective January 5, 2026 per the page). "Now Savings Account" and
  // "Now Flexi DPS" are balance-tiered, not tenure-based, so they don't fit
  // this schema's amount+tenure model and are intentionally left out.
  //
  // Now FD published tenures: 15d, 30d, 45d, 60d, 75d, 90d, then every month
  // 4-12, then flat 13-36mo. Only whole-month tenures are entered (this app's
  // tenure model is month-granular); the sub-month day-count tenures (15/30/
  // 45/60/75/90 days) are skipped as not representable.
  { institutionName: "Prime NOW", productType: "FDR", productNameHint: "Now FD", tenureMonths: 4, minAmount: 0, interestRatePct: 9.25, sourceUrl: "https://primenow.ai/product-rates" },
  { institutionName: "Prime NOW", productType: "FDR", productNameHint: "Now FD", tenureMonths: 5, minAmount: 0, interestRatePct: 9.25, sourceUrl: "https://primenow.ai/product-rates" },
  { institutionName: "Prime NOW", productType: "FDR", productNameHint: "Now FD", tenureMonths: 6, minAmount: 0, interestRatePct: 9.25, sourceUrl: "https://primenow.ai/product-rates" },
  { institutionName: "Prime NOW", productType: "FDR", productNameHint: "Now FD", tenureMonths: 7, minAmount: 0, interestRatePct: 9.75, sourceUrl: "https://primenow.ai/product-rates" },
  { institutionName: "Prime NOW", productType: "FDR", productNameHint: "Now FD", tenureMonths: 8, minAmount: 0, interestRatePct: 9.75, sourceUrl: "https://primenow.ai/product-rates" },
  { institutionName: "Prime NOW", productType: "FDR", productNameHint: "Now FD", tenureMonths: 9, minAmount: 0, interestRatePct: 9.75, sourceUrl: "https://primenow.ai/product-rates" },
  { institutionName: "Prime NOW", productType: "FDR", productNameHint: "Now FD", tenureMonths: 10, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://primenow.ai/product-rates" },
  { institutionName: "Prime NOW", productType: "FDR", productNameHint: "Now FD", tenureMonths: 11, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://primenow.ai/product-rates" },
  { institutionName: "Prime NOW", productType: "FDR", productNameHint: "Now FD", tenureMonths: 12, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://primenow.ai/product-rates" },
  // 13-36mo published as a single flat 10.00% band, marked with an asterisk on
  // the source page whose footnote text wasn't available to read — entered as
  // published (10.00%) at the boundary tenures since the page gives no
  // step-down within this range, same convention as other banks' flat-band DPS.
  { institutionName: "Prime NOW", productType: "FDR", productNameHint: "Now FD", tenureMonths: 24, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://primenow.ai/product-rates" },
  { institutionName: "Prime NOW", productType: "FDR", productNameHint: "Now FD", tenureMonths: 36, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://primenow.ai/product-rates" },

  // Now Fixed DPS: 6-18mo @ 8.00%, 19-36mo @ 8.50%, 37-120mo @ 9.00%
  { institutionName: "Prime NOW", productType: "DPS", productNameHint: "Now Fixed DPS", tenureMonths: 6, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://primenow.ai/product-rates" },
  { institutionName: "Prime NOW", productType: "DPS", productNameHint: "Now Fixed DPS", tenureMonths: 12, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://primenow.ai/product-rates" },
  { institutionName: "Prime NOW", productType: "DPS", productNameHint: "Now Fixed DPS", tenureMonths: 18, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://primenow.ai/product-rates" },
  { institutionName: "Prime NOW", productType: "DPS", productNameHint: "Now Fixed DPS", tenureMonths: 24, minAmount: 0, interestRatePct: 8.5, sourceUrl: "https://primenow.ai/product-rates" },
  { institutionName: "Prime NOW", productType: "DPS", productNameHint: "Now Fixed DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 8.5, sourceUrl: "https://primenow.ai/product-rates" },
  { institutionName: "Prime NOW", productType: "DPS", productNameHint: "Now Fixed DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://primenow.ai/product-rates" },
  { institutionName: "Prime NOW", productType: "DPS", productNameHint: "Now Fixed DPS", tenureMonths: 84, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://primenow.ai/product-rates" },
  { institutionName: "Prime NOW", productType: "DPS", productNameHint: "Now Fixed DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://primenow.ai/product-rates" },

  // ============================================================
  // Islamic banking (Mudaraba profit-sharing) products, sourced 2026-08-31.
  // See research findings appended to research/rate-research-2026-08-28.md
  // for the full per-bank methodology. Rates here are "provisional profit
  // rates" as published by each bank — not guaranteed interest, and subject
  // to the bank's actual earnings for the period. Institutions/products with
  // no clearly published Islamic rate are intentionally left as shells (see
  // notes at the end of this section) rather than filled with a guess.
  // ============================================================

  // --- Islami Bank Bangladesh --- full-fledged Islamic bank. Provisional
  // Profit Rates on Mudaraba Deposits w.e.f 01.01.2026, read directly from
  // the bank's own PDF, all rows marked "Unchanged" (i.e. still current).
  { institutionName: "Islami Bank Bangladesh", productType: "FDR", productNameHint: "Mudaraba Term Deposit", tenureMonths: 1, minAmount: 0, interestRatePct: 5.25, sourceUrl: "https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf" },
  { institutionName: "Islami Bank Bangladesh", productType: "FDR", productNameHint: "Mudaraba Term Deposit", tenureMonths: 3, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf" },
  { institutionName: "Islami Bank Bangladesh", productType: "FDR", productNameHint: "Mudaraba Term Deposit", tenureMonths: 6, minAmount: 0, interestRatePct: 9.8, sourceUrl: "https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf" },
  { institutionName: "Islami Bank Bangladesh", productType: "FDR", productNameHint: "Mudaraba Term Deposit", tenureMonths: 12, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf" },
  { institutionName: "Islami Bank Bangladesh", productType: "FDR", productNameHint: "Mudaraba Term Deposit", tenureMonths: 24, minAmount: 0, interestRatePct: 10.2, sourceUrl: "https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf" },
  { institutionName: "Islami Bank Bangladesh", productType: "FDR", productNameHint: "Mudaraba Term Deposit", tenureMonths: 36, minAmount: 0, interestRatePct: 10.5, sourceUrl: "https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf" },
  // "Mudaraba Special Savings (Pension) including RDS MSS" — the bank's
  // closest named product to a classic recurring-installment DPS.
  { institutionName: "Islami Bank Bangladesh", productType: "DPS", productNameHint: "Mudaraba Deposit Pension Scheme", tenureMonths: 6, minAmount: 0, interestRatePct: 5.25, sourceUrl: "https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf" },
  { institutionName: "Islami Bank Bangladesh", productType: "DPS", productNameHint: "Mudaraba Deposit Pension Scheme", tenureMonths: 12, minAmount: 0, interestRatePct: 5.75, sourceUrl: "https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf" },
  { institutionName: "Islami Bank Bangladesh", productType: "DPS", productNameHint: "Mudaraba Deposit Pension Scheme", tenureMonths: 24, minAmount: 0, interestRatePct: 6.0, sourceUrl: "https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf" },
  { institutionName: "Islami Bank Bangladesh", productType: "DPS", productNameHint: "Mudaraba Deposit Pension Scheme", tenureMonths: 36, minAmount: 0, interestRatePct: 6.75, sourceUrl: "https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf" },
  { institutionName: "Islami Bank Bangladesh", productType: "DPS", productNameHint: "Mudaraba Deposit Pension Scheme", tenureMonths: 48, minAmount: 0, interestRatePct: 6.75, sourceUrl: "https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf" },
  { institutionName: "Islami Bank Bangladesh", productType: "DPS", productNameHint: "Mudaraba Deposit Pension Scheme", tenureMonths: 60, minAmount: 0, interestRatePct: 7.25, sourceUrl: "https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf" },
  { institutionName: "Islami Bank Bangladesh", productType: "DPS", productNameHint: "Mudaraba Deposit Pension Scheme", tenureMonths: 84, minAmount: 0, interestRatePct: 7.5, sourceUrl: "https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf" },
  { institutionName: "Islami Bank Bangladesh", productType: "DPS", productNameHint: "Mudaraba Deposit Pension Scheme", tenureMonths: 120, minAmount: 0, interestRatePct: 7.75, sourceUrl: "https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf" },
  { institutionName: "Islami Bank Bangladesh", productType: "DPS", productNameHint: "Mudaraba Deposit Pension Scheme", tenureMonths: 180, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf" },

  // --- Agrani Bank --- Agrani Islamic Banking. "Provisional Rate of Profit
  // (Effective From 10-02-2026)" from the bank's own Islamic banking page.
  { institutionName: "Agrani Bank", productType: "FDR", productNameHint: "Islamic Banking Mudaraba FDR", tenureMonths: 1, minAmount: 0, interestRatePct: 3.5, sourceUrl: "https://www.agranibank.org/index.php/home/islamic_banking/Deposit-Products" },
  { institutionName: "Agrani Bank", productType: "FDR", productNameHint: "Islamic Banking Mudaraba FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 7.5, sourceUrl: "https://www.agranibank.org/index.php/home/islamic_banking/Deposit-Products" },
  { institutionName: "Agrani Bank", productType: "FDR", productNameHint: "Islamic Banking Mudaraba FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 7.75, sourceUrl: "https://www.agranibank.org/index.php/home/islamic_banking/Deposit-Products" },
  { institutionName: "Agrani Bank", productType: "FDR", productNameHint: "Islamic Banking Mudaraba FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://www.agranibank.org/index.php/home/islamic_banking/Deposit-Products" },
  // Mudaraba Special Savings Scheme (MSS) — closest recurring-DPS analog in
  // Agrani's Islamic lineup; page publishes only the 5yr/10yr boundary rates.
  { institutionName: "Agrani Bank", productType: "DPS", productNameHint: "Islamic Banking Mudaraba DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 7.5, sourceUrl: "https://www.agranibank.org/index.php/home/islamic_banking/Deposit-Products" },
  { institutionName: "Agrani Bank", productType: "DPS", productNameHint: "Islamic Banking Mudaraba DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://www.agranibank.org/index.php/home/islamic_banking/Deposit-Products" },

  // --- Dhaka Bank --- Tayyebah Dhaka Islamic Banking. Mudaraba Special
  // Deposit Scheme (MSDS), rates effective March 03, 2026. Only the
  // FDR-equivalent is entered — Dhaka Bank's two DPS-style Islamic products
  // (Tayyebah Kotipoti, Mudaraba Deposit Pension Scheme) publish only a
  // 8.50%-10.00% range with no per-tenure breakdown, so they're skipped
  // rather than guessing where in that range each tenure falls.
  //   Checked 2026-09-18: the bank's Sep-16-2026 treasury sheet does carry a
  //   "Fixed Deposit Rates-Islamic Banking" table, but it prices a DIFFERENT
  //   product — "Regular Fixed Deposit (Retail)/(SME)/(Corporate)" at a flat
  //   6.00% for 3/6/12/18/24mo (1mo 4.00%). That is Dhaka Bank's plain
  //   Islamic term deposit, not the MSDS scheme the rows below track, so the
  //   two are deliberately NOT merged. If the app ever adds a second Islamic
  //   FDR product for this bank, that table is the source for it.
  { institutionName: "Dhaka Bank", productType: "FDR", productNameHint: "Tayyebah Dhaka Islamic Banking Mudaraba FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 9.6, sourceUrl: "https://dhakabank.com.bd/mudaraba-special-deposit-pension-scheme-msds/" },
  { institutionName: "Dhaka Bank", productType: "FDR", productNameHint: "Tayyebah Dhaka Islamic Banking Mudaraba FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://dhakabank.com.bd/mudaraba-special-deposit-pension-scheme-msds/" },
  { institutionName: "Dhaka Bank", productType: "FDR", productNameHint: "Tayyebah Dhaka Islamic Banking Mudaraba FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://dhakabank.com.bd/mudaraba-special-deposit-pension-scheme-msds/" },

  // --- Prime Bank --- Prime Bank Islamic Banking. Re-verified 2026-09-01
  // directly against the bank's "Provisional Profit Rate" PDF (effective Aug
  // 31, 2026). Prime Hasanah Edu DPS unchanged, flat 9.25% across its
  // published 5/10/15/20-year tenures. The old "Mudaraba Term Deposit" FDR
  // product is now listed as DISCONTINUED (fresh booking not allowed), but
  // the bank carried the exact same rate table over to its replacement
  // product, "Prime Hasanah Term Deposit" -- a rebrand, not a rate change --
  // so the FDR shell is now filled with real, live, bookable numbers
  // (Any Amount tier). Mudaraba 150% Deposit Scheme and Prime Hasanah
  // Double Benefit Scheme are different kinds of schemes (deposit-doubles /
  // lump-sum-multiplier), not entered as standard FDR tenures.
  { institutionName: "Prime Bank", productType: "FDR", productNameHint: "Prime Bank Islamic Banking Mudaraba FDR", tenureMonths: 1, minAmount: 0, interestRatePct: 2.0, sourceUrl: "https://www.primebank.com.bd/assets/interest-rate/1788156318-Provisional-Profit-Rate-Islamic-w-e-f-31-AUG-26-UPDATED.pdf" },
  { institutionName: "Prime Bank", productType: "FDR", productNameHint: "Prime Bank Islamic Banking Mudaraba FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 5.5, sourceUrl: "https://www.primebank.com.bd/assets/interest-rate/1788156318-Provisional-Profit-Rate-Islamic-w-e-f-31-AUG-26-UPDATED.pdf" },
  { institutionName: "Prime Bank", productType: "FDR", productNameHint: "Prime Bank Islamic Banking Mudaraba FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 6.5, sourceUrl: "https://www.primebank.com.bd/assets/interest-rate/1788156318-Provisional-Profit-Rate-Islamic-w-e-f-31-AUG-26-UPDATED.pdf" },
  { institutionName: "Prime Bank", productType: "FDR", productNameHint: "Prime Bank Islamic Banking Mudaraba FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 7.0, sourceUrl: "https://www.primebank.com.bd/assets/interest-rate/1788156318-Provisional-Profit-Rate-Islamic-w-e-f-31-AUG-26-UPDATED.pdf" },
  { institutionName: "Prime Bank", productType: "FDR", productNameHint: "Prime Bank Islamic Banking Mudaraba FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 6.5, sourceUrl: "https://www.primebank.com.bd/assets/interest-rate/1788156318-Provisional-Profit-Rate-Islamic-w-e-f-31-AUG-26-UPDATED.pdf" },
  { institutionName: "Prime Bank", productType: "FDR", productNameHint: "Prime Bank Islamic Banking Mudaraba FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 6.5, sourceUrl: "https://www.primebank.com.bd/assets/interest-rate/1788156318-Provisional-Profit-Rate-Islamic-w-e-f-31-AUG-26-UPDATED.pdf" },
  { institutionName: "Prime Bank", productType: "DPS", productNameHint: "Prime Bank Islamic Banking Mudaraba DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 9.25, sourceUrl: "https://www.primebank.com.bd/islamic/save/deposit-schemes/prime-hasanah-edu-dps" },
  { institutionName: "Prime Bank", productType: "DPS", productNameHint: "Prime Bank Islamic Banking Mudaraba DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 9.25, sourceUrl: "https://www.primebank.com.bd/islamic/save/deposit-schemes/prime-hasanah-edu-dps" },
  { institutionName: "Prime Bank", productType: "DPS", productNameHint: "Prime Bank Islamic Banking Mudaraba DPS", tenureMonths: 180, minAmount: 0, interestRatePct: 9.25, sourceUrl: "https://www.primebank.com.bd/islamic/save/deposit-schemes/prime-hasanah-edu-dps" },
  { institutionName: "Prime Bank", productType: "DPS", productNameHint: "Prime Bank Islamic Banking Mudaraba DPS", tenureMonths: 240, minAmount: 0, interestRatePct: 9.25, sourceUrl: "https://www.primebank.com.bd/islamic/save/deposit-schemes/prime-hasanah-edu-dps" },

  // --- The City Bank --- City Islamic does not publish an advertised
  // forward-looking rate table ("cannot provide certain profit rate to the
  // depositors in advance"). These are HISTORICAL ACTUAL PROFIT DISTRIBUTED
  // figures from the bank's own Investment Income Sharing Ratio (IISR)
  // report, effective 21-Apr-2026 (period: June 2026) -- a genuinely
  // different kind of number than other banks' advertised rate cards.
  // Re-verified 2026-09-01 directly against the live page's full table
  // (Individual, "Upto 1 crore" tier). FDR expanded from a single 12mo
  // snapshot to the full published tenure ladder ("Islamic Term Deposit").
  // DPS corrected: the previously-stored 7.73%/6mo was actually pulled from
  // "Islamic Monthly Benefit Scheme" -- a lump-sum, monthly-payout product,
  // not a recurring deposit. The real DPS analog is "Islamic Monthly
  // Deposit Scheme," a flat 7.64% across all published tenures (1-10yr).
  { institutionName: "The City Bank", productType: "FDR", productNameHint: "City Islamic Mudaraba FDR", tenureMonths: 1, minAmount: 0, maxAmount: 10000000, interestRatePct: 1.53, sourceUrl: "https://islamic.thecitybank.com/profit-sharing-ratio" },
  { institutionName: "The City Bank", productType: "FDR", productNameHint: "City Islamic Mudaraba FDR", tenureMonths: 3, minAmount: 0, maxAmount: 10000000, interestRatePct: 5.94, sourceUrl: "https://islamic.thecitybank.com/profit-sharing-ratio" },
  { institutionName: "The City Bank", productType: "FDR", productNameHint: "City Islamic Mudaraba FDR", tenureMonths: 6, minAmount: 0, maxAmount: 10000000, interestRatePct: 6.28, sourceUrl: "https://islamic.thecitybank.com/profit-sharing-ratio" },
  { institutionName: "The City Bank", productType: "FDR", productNameHint: "City Islamic Mudaraba FDR", tenureMonths: 12, minAmount: 0, maxAmount: 10000000, interestRatePct: 6.45, sourceUrl: "https://islamic.thecitybank.com/profit-sharing-ratio" },
  { institutionName: "The City Bank", productType: "FDR", productNameHint: "City Islamic Mudaraba FDR", tenureMonths: 15, minAmount: 0, maxAmount: 10000000, interestRatePct: 6.96, sourceUrl: "https://islamic.thecitybank.com/profit-sharing-ratio" },
  { institutionName: "The City Bank", productType: "FDR", productNameHint: "City Islamic Mudaraba FDR", tenureMonths: 24, minAmount: 0, maxAmount: 10000000, interestRatePct: 6.96, sourceUrl: "https://islamic.thecitybank.com/profit-sharing-ratio" },
  { institutionName: "The City Bank", productType: "FDR", productNameHint: "City Islamic Mudaraba FDR", tenureMonths: 36, minAmount: 0, maxAmount: 10000000, interestRatePct: 6.96, sourceUrl: "https://islamic.thecitybank.com/profit-sharing-ratio" },
  { institutionName: "The City Bank", productType: "DPS", productNameHint: "City Islamic Mudaraba DPS", tenureMonths: 12, minAmount: 0, interestRatePct: 7.64, sourceUrl: "https://islamic.thecitybank.com/profit-sharing-ratio" },
  { institutionName: "The City Bank", productType: "DPS", productNameHint: "City Islamic Mudaraba DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 7.64, sourceUrl: "https://islamic.thecitybank.com/profit-sharing-ratio" },
  { institutionName: "The City Bank", productType: "DPS", productNameHint: "City Islamic Mudaraba DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 7.64, sourceUrl: "https://islamic.thecitybank.com/profit-sharing-ratio" },

  // --- Mutual Trust Bank --- MTB Islamic. Full official rate sheet, PDF
  // "MTB Islamic Savings Accounts, SND, Term Deposits & Savings Schemes".
  // Re-verified 2026-09-05, found via the bank's live mtb-yaqeen page
  // linking a genuinely newer PDF (the July-2026 one this app had stored
  // was superseded, not just re-labeled). "MTB Islamic Term Deposit
  // (Individual) / MTB Islamic Angona Term Deposit" balance <50 Lac tier,
  // effective Sep 3, 2026 -- real drift from the prior check: 1mo rose
  // 3.5%->4.5%, other tenures unchanged. Re-checked again 2026-09-11: the
  // PDF rolled once more (v2 -> v3, effective date moved Sep 3 -> Sep 10)
  // but every number is unchanged -- URL updated for traceability only.
  { institutionName: "Mutual Trust Bank", productType: "FDR", productNameHint: "MTB Yaqeen Mudaraba FDR", tenureMonths: 1, minAmount: 0, maxAmount: 5000000, interestRatePct: 4.5, sourceUrl: "https://www.mutualtrustbank.com/wp-content/uploads/2026/09/Profit-on-Deposit-Latest-Sep-v3.pdf" },
  { institutionName: "Mutual Trust Bank", productType: "FDR", productNameHint: "MTB Yaqeen Mudaraba FDR", tenureMonths: 3, minAmount: 0, maxAmount: 5000000, interestRatePct: 7.75, sourceUrl: "https://www.mutualtrustbank.com/wp-content/uploads/2026/09/Profit-on-Deposit-Latest-Sep-v3.pdf" },
  { institutionName: "Mutual Trust Bank", productType: "FDR", productNameHint: "MTB Yaqeen Mudaraba FDR", tenureMonths: 6, minAmount: 0, maxAmount: 5000000, interestRatePct: 8.0, sourceUrl: "https://www.mutualtrustbank.com/wp-content/uploads/2026/09/Profit-on-Deposit-Latest-Sep-v3.pdf" },
  { institutionName: "Mutual Trust Bank", productType: "FDR", productNameHint: "MTB Yaqeen Mudaraba FDR", tenureMonths: 12, minAmount: 0, maxAmount: 5000000, interestRatePct: 8.0, sourceUrl: "https://www.mutualtrustbank.com/wp-content/uploads/2026/09/Profit-on-Deposit-Latest-Sep-v3.pdf" },
  { institutionName: "Mutual Trust Bank", productType: "FDR", productNameHint: "MTB Yaqeen Mudaraba FDR", tenureMonths: 24, minAmount: 0, maxAmount: 5000000, interestRatePct: 8.0, sourceUrl: "https://www.mutualtrustbank.com/wp-content/uploads/2026/09/Profit-on-Deposit-Latest-Sep-v3.pdf" },
  { institutionName: "Mutual Trust Bank", productType: "FDR", productNameHint: "MTB Yaqeen Mudaraba FDR", tenureMonths: 36, minAmount: 0, maxAmount: 5000000, interestRatePct: 8.0, sourceUrl: "https://www.mutualtrustbank.com/wp-content/uploads/2026/09/Profit-on-Deposit-Latest-Sep-v3.pdf" },
  // "MTB Islamic Brick by Brick Scheme / MTB Islamic Flexible Scheme
  // (Individual)" — recurring Islamic DPS-equivalent, effective Sep 2,
  // 2026. Real drift: every tenure dropped materially (was 8.75-10%, now
  // 8.0-8.5%).
  { institutionName: "Mutual Trust Bank", productType: "DPS", productNameHint: "MTB Yaqeen Mudaraba DPS", tenureMonths: 12, minAmount: 0, interestRatePct: 8.5, sourceUrl: "https://www.mutualtrustbank.com/wp-content/uploads/2026/09/Profit-on-Deposit-Latest-Sep-v3.pdf" },
  { institutionName: "Mutual Trust Bank", productType: "DPS", productNameHint: "MTB Yaqeen Mudaraba DPS", tenureMonths: 24, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://www.mutualtrustbank.com/wp-content/uploads/2026/09/Profit-on-Deposit-Latest-Sep-v3.pdf" },
  { institutionName: "Mutual Trust Bank", productType: "DPS", productNameHint: "MTB Yaqeen Mudaraba DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://www.mutualtrustbank.com/wp-content/uploads/2026/09/Profit-on-Deposit-Latest-Sep-v3.pdf" },
  { institutionName: "Mutual Trust Bank", productType: "DPS", productNameHint: "MTB Yaqeen Mudaraba DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://www.mutualtrustbank.com/wp-content/uploads/2026/09/Profit-on-Deposit-Latest-Sep-v3.pdf" },
  { institutionName: "Mutual Trust Bank", productType: "DPS", productNameHint: "MTB Yaqeen Mudaraba DPS", tenureMonths: 96, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://www.mutualtrustbank.com/wp-content/uploads/2026/09/Profit-on-Deposit-Latest-Sep-v3.pdf" },
  { institutionName: "Mutual Trust Bank", productType: "DPS", productNameHint: "MTB Yaqeen Mudaraba DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://www.mutualtrustbank.com/wp-content/uploads/2026/09/Profit-on-Deposit-Latest-Sep-v3.pdf" },
  { institutionName: "Mutual Trust Bank", productType: "DPS", productNameHint: "MTB Yaqeen Mudaraba DPS", tenureMonths: 144, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://www.mutualtrustbank.com/wp-content/uploads/2026/09/Profit-on-Deposit-Latest-Sep-v3.pdf" },
  { institutionName: "Mutual Trust Bank", productType: "DPS", productNameHint: "MTB Yaqeen Mudaraba DPS", tenureMonths: 180, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://www.mutualtrustbank.com/wp-content/uploads/2026/09/Profit-on-Deposit-Latest-Sep-v3.pdf" },

  // --- Bank Asia --- Bank Asia Islamic Banking. "Mudaraba Term Deposit
  // Account (MTDA)", Individual tier, effective August 09, 2026.
  { institutionName: "Bank Asia", productType: "FDR", productNameHint: "Bank Asia Islamic Banking Mudaraba FDR", tenureMonths: 1, minAmount: 0, interestRatePct: 4.0, sourceUrl: "https://www.bankasia-bd.com/islamic/product/Profit-on-Deposit" },
  { institutionName: "Bank Asia", productType: "FDR", productNameHint: "Bank Asia Islamic Banking Mudaraba FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 6.8, sourceUrl: "https://www.bankasia-bd.com/islamic/product/Profit-on-Deposit" },
  { institutionName: "Bank Asia", productType: "FDR", productNameHint: "Bank Asia Islamic Banking Mudaraba FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 7.0, sourceUrl: "https://www.bankasia-bd.com/islamic/product/Profit-on-Deposit" },
  { institutionName: "Bank Asia", productType: "FDR", productNameHint: "Bank Asia Islamic Banking Mudaraba FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 7.0, sourceUrl: "https://www.bankasia-bd.com/islamic/product/Profit-on-Deposit" },
  { institutionName: "Bank Asia", productType: "FDR", productNameHint: "Bank Asia Islamic Banking Mudaraba FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 7.0, sourceUrl: "https://www.bankasia-bd.com/islamic/product/Profit-on-Deposit" },
  { institutionName: "Bank Asia", productType: "FDR", productNameHint: "Bank Asia Islamic Banking Mudaraba FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 7.0, sourceUrl: "https://www.bankasia-bd.com/islamic/product/Profit-on-Deposit" },
  { institutionName: "Bank Asia", productType: "FDR", productNameHint: "Bank Asia Islamic Banking Mudaraba FDR", tenureMonths: 48, minAmount: 0, interestRatePct: 7.0, sourceUrl: "https://www.bankasia-bd.com/islamic/product/Profit-on-Deposit" },
  { institutionName: "Bank Asia", productType: "FDR", productNameHint: "Bank Asia Islamic Banking Mudaraba FDR", tenureMonths: 60, minAmount: 0, interestRatePct: 7.0, sourceUrl: "https://www.bankasia-bd.com/islamic/product/Profit-on-Deposit" },
  // "Mudaraba Deposit Pension Scheme (MDPS)" — single flat provisional rate
  // published for the whole 3-12yr range, no per-tenure step given.
  { institutionName: "Bank Asia", productType: "DPS", productNameHint: "Bank Asia Islamic Banking Mudaraba DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 6.45, sourceUrl: "https://www.bankasia-bd.com/islamic/product/Profit-on-Deposit" },
  { institutionName: "Bank Asia", productType: "DPS", productNameHint: "Bank Asia Islamic Banking Mudaraba DPS", tenureMonths: 144, minAmount: 0, interestRatePct: 6.45, sourceUrl: "https://www.bankasia-bd.com/islamic/product/Profit-on-Deposit" },

  // --- Trust Bank Islamic (TIB) --- ALL ENTRIES REMOVED 2026-09-18.
  //
  // Both source URLs this section relied on now 404, found by sweeping every
  // sourceUrl in this file rather than by spot-checking:
  //   /rates-and-charges/mudaraba-deposit-rates  (was: MTDR 1/3/6/12mo =
  //     3.00/7.50/7.50/7.50%, Individuals & Provident Funds, eff. 10-Aug-2026)
  //   /islamic-banking/deposit-accounts/mudaraba-monthly-savings-scheme
  //     (was: MMSS flat 6.00% across 3/5/8/10/12yr)
  //
  // Trust Bank reorganised its site in the 15-Sep-2026 repricing (the same
  // move that relocated its conventional rates to /rates/). Its Islamic
  // section survives at https://www.tblbd.com/islamic/ but publishes no rate
  // figures at all -- zero percentage values and no Mudaraba product links
  // anywhere in the page -- and /islamic/rates/ does not exist. So there is
  // currently no live source for any Trust Bank Islamic rate.
  //
  // Left as shells, consistent with how this file treats every other
  // unpublished rate, and with the conventional Trust Bank DPS removed in the
  // same sweep. Re-add if the bank republishes a Mudaraba rate table.

  // --- IFIC Bank --- IFIC Islamic. "Mudaraba Term Deposit", Provisional
  // Rates W.E.F. 16.08.2026 (read directly from the bank's own PDF).
  // No DPS entry: the PDF's other candidate recurring-deposit products
  // ("Mudaraba Hajj DPS" is Hajj-purpose-restricted; "Mudaraba Aamar
  // Bhobishawt" has no published tenure breakdown and its product type
  // couldn't be confirmed) -- left as a DPS shell rather than guessing.
  { institutionName: "IFIC Bank", productType: "FDR", productNameHint: "IFIC Islamic Mudaraba FDR", tenureMonths: 1, minAmount: 0, interestRatePct: 5.0, sourceUrl: "https://ificbank.com.bd/public/islamic/Latest-Deposit-Rate-Islamic-16-08-2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", productNameHint: "IFIC Islamic Mudaraba FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://ificbank.com.bd/public/islamic/Latest-Deposit-Rate-Islamic-16-08-2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", productNameHint: "IFIC Islamic Mudaraba FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://ificbank.com.bd/public/islamic/Latest-Deposit-Rate-Islamic-16-08-2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", productNameHint: "IFIC Islamic Mudaraba FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://ificbank.com.bd/public/islamic/Latest-Deposit-Rate-Islamic-16-08-2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", productNameHint: "IFIC Islamic Mudaraba FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://ificbank.com.bd/public/islamic/Latest-Deposit-Rate-Islamic-16-08-2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", productNameHint: "IFIC Islamic Mudaraba FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://ificbank.com.bd/public/islamic/Latest-Deposit-Rate-Islamic-16-08-2026.pdf" },

  // --- United Commercial Bank (UCB Taqwa) --- found 2026-09-01, rolled
  // again 2026-09-11: UCB's own "income-sharing-ratio-and-deposit" page
  // still explains only the ISR *methodology* with no numbers, but a
  // separate, actively-updated monthly rate-sheet PDF exists (analogous to
  // UCB's conventional instruction-circular pattern) publishing both the
  // ISR% and the resulting computed Profit Rate% -- a real percentage,
  // same shape as every other bank here. Using the most recent column
  // (Aug-26) from "General Product (Retail)" -- real drift from the prior
  // check: every tenure rose (e.g. 12mo 8.06%->8.45%). Note: this PDF's
  // filename is dated and gets replaced monthly (e.g. ...july-2026.pdf ->
  // ...august-2026.pdf) -- if this exact URL 404s on a future re-check,
  // look for the current one via https://www.ucb.com.bd/rates/interest-rates/
  // rather than assuming no data exists again.
  { institutionName: "United Commercial Bank", productType: "FDR", productNameHint: "UCB Taqwa Mudaraba FDR", tenureMonths: 1, minAmount: 0, interestRatePct: 3.98, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/ucb-islamic-rate-sheet-august-2026.pdf" },
  { institutionName: "United Commercial Bank", productType: "FDR", productNameHint: "UCB Taqwa Mudaraba FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 8.45, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/ucb-islamic-rate-sheet-august-2026.pdf" },
  { institutionName: "United Commercial Bank", productType: "FDR", productNameHint: "UCB Taqwa Mudaraba FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 8.45, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/ucb-islamic-rate-sheet-august-2026.pdf" },
  { institutionName: "United Commercial Bank", productType: "FDR", productNameHint: "UCB Taqwa Mudaraba FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 8.45, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/ucb-islamic-rate-sheet-august-2026.pdf" },
  { institutionName: "United Commercial Bank", productType: "FDR", productNameHint: "UCB Taqwa Mudaraba FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 8.45, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/ucb-islamic-rate-sheet-august-2026.pdf" },
  { institutionName: "United Commercial Bank", productType: "FDR", productNameHint: "UCB Taqwa Mudaraba FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 8.45, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/ucb-islamic-rate-sheet-august-2026.pdf" },
  { institutionName: "United Commercial Bank", productType: "DPS", productNameHint: "UCB Taqwa Mudaraba DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 7.95, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/ucb-islamic-rate-sheet-august-2026.pdf" },
  { institutionName: "United Commercial Bank", productType: "DPS", productNameHint: "UCB Taqwa Mudaraba DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 8.45, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/ucb-islamic-rate-sheet-august-2026.pdf" },
  { institutionName: "United Commercial Bank", productType: "DPS", productNameHint: "UCB Taqwa Mudaraba DPS", tenureMonths: 84, minAmount: 0, interestRatePct: 8.45, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/ucb-islamic-rate-sheet-august-2026.pdf" },
  { institutionName: "United Commercial Bank", productType: "DPS", productNameHint: "UCB Taqwa Mudaraba DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 8.45, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/ucb-islamic-rate-sheet-august-2026.pdf" },

  // --- Eastern Bank (EBL) Islamic --- found 2026-09-01: EBL's profit-
  // distribution page (previously 403-blocked, now live) now publishes a
  // full "Weightage and Provisional Rate of Return" table with genuine
  // percentages, effective from May 03, 2026 -- superseding the earlier
  // bank-wide-35:65-ratio-only finding entirely. Retail tier used, matching
  // the base-tier convention used for other banks. DPS uses "EBL Islamic
  // DPS Account - Confidence", a genuine recurring-deposit product (not the
  // separate "Mudarabah Monthly Profit Scheme," which is a lump-sum
  // monthly-payout product -- same distinction as the City Bank DPS fix).
  { institutionName: "Eastern Bank", productType: "FDR", productNameHint: "EBL Islamic Banking Mudaraba FDR", tenureMonths: 1, minAmount: 0, interestRatePct: 3.0, sourceUrl: "https://ebl.com.bd/islamic/profit-distribution" },
  { institutionName: "Eastern Bank", productType: "FDR", productNameHint: "EBL Islamic Banking Mudaraba FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://ebl.com.bd/islamic/profit-distribution" },
  { institutionName: "Eastern Bank", productType: "FDR", productNameHint: "EBL Islamic Banking Mudaraba FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://ebl.com.bd/islamic/profit-distribution" },
  { institutionName: "Eastern Bank", productType: "FDR", productNameHint: "EBL Islamic Banking Mudaraba FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 8.5, sourceUrl: "https://ebl.com.bd/islamic/profit-distribution" },
  { institutionName: "Eastern Bank", productType: "FDR", productNameHint: "EBL Islamic Banking Mudaraba FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://ebl.com.bd/islamic/profit-distribution" },
  { institutionName: "Eastern Bank", productType: "FDR", productNameHint: "EBL Islamic Banking Mudaraba FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://ebl.com.bd/islamic/profit-distribution" },
  { institutionName: "Eastern Bank", productType: "DPS", productNameHint: "EBL Islamic Banking Mudaraba DPS", tenureMonths: 12, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://ebl.com.bd/islamic/profit-distribution" },
  { institutionName: "Eastern Bank", productType: "DPS", productNameHint: "EBL Islamic Banking Mudaraba DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://ebl.com.bd/islamic/profit-distribution" },
  { institutionName: "Eastern Bank", productType: "DPS", productNameHint: "EBL Islamic Banking Mudaraba DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://ebl.com.bd/islamic/profit-distribution" },
  { institutionName: "Eastern Bank", productType: "DPS", productNameHint: "EBL Islamic Banking Mudaraba DPS", tenureMonths: 96, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://ebl.com.bd/islamic/profit-distribution" },
  { institutionName: "Eastern Bank", productType: "DPS", productNameHint: "EBL Islamic Banking Mudaraba DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://ebl.com.bd/islamic/profit-distribution" },
  { institutionName: "Eastern Bank", productType: "DPS", productNameHint: "EBL Islamic Banking Mudaraba DPS", tenureMonths: 144, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://ebl.com.bd/islamic/profit-distribution" },
  { institutionName: "Eastern Bank", productType: "DPS", productNameHint: "EBL Islamic Banking Mudaraba DPS", tenureMonths: 180, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://ebl.com.bd/islamic/profit-distribution" },

  // --- Jamuna Bank Islamic --- Jamuna's own site (both /islamic/ and
  // /interest-rates/) still publishes product names only, no rate figures
  // anywhere (re-confirmed 2026-09-01). But Bangladesh Bank's official
  // regulator page (the actual government authority these banks report
  // to) publishes an aggregate "Interest Rate of Scheduled Banks - Islamic
  // Banking Window" table covering every bank including Jamuna, for
  // August 2026. Its Fixed Deposit columns are RANGES per tenure band
  // (e.g. "7.25-9.90%" for 3-6mo) rather than one number -- using the
  // upper bound as the advertised "best/up to" rate, consistent with how
  // this app already frames every other rate. Tenure bands mapped to their
  // starting month (3-6mo band -> 3mo, 6mo-1yr band -> 6mo, 1-2yr band ->
  // 12mo); Jamuna's 2-3yr and 3yr+ bands are blank in BB's table, so no
  // entry for those tenures. No DPS entry: BB's table only covers Fixed
  // Deposit, Savings, and SND -- not a recurring DPS product.
  { institutionName: "Jamuna Bank", productType: "FDR", productNameHint: "Jamuna Islami Banking Mudaraba FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 9.90, sourceUrl: "https://www.bb.org.bd/en/index.php/financialactivity/intdepo_bankislamic" },
  { institutionName: "Jamuna Bank", productType: "FDR", productNameHint: "Jamuna Islami Banking Mudaraba FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 9.60, sourceUrl: "https://www.bb.org.bd/en/index.php/financialactivity/intdepo_bankislamic" },
  { institutionName: "Jamuna Bank", productType: "FDR", productNameHint: "Jamuna Islami Banking Mudaraba FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 9.40, sourceUrl: "https://www.bb.org.bd/en/index.php/financialactivity/intdepo_bankislamic" },

  // --- IFIC Bank Islamic DPS --- found 2026-09-01, re-reading the same
  // PDF used for IFIC's FDR entries above: "Mudaraba Hajj DPS" publishes a
  // genuine flat 9.00% p.a. rate. It's the only recurring-deposit-shaped
  // Islamic product IFIC gives a number for (Mudaraba Aamar Bhobishawt is
  // a different, unconfirmed product type; Mudaraba Mashik Munafa Scheme
  // is a lump-sum monthly-payout product, not a recurring deposit -- same
  // distinction as EBL/City Bank's DPS fixes). Purpose-labeled for Hajj,
  // but it's real, sourced, and the only DPS-shaped number this bank
  // publishes, so entered as the DPS shell's rate with a note in case the
  // Hajj-specific framing matters for display later.
  { institutionName: "IFIC Bank", productType: "DPS", productNameHint: "IFIC Islamic Mudaraba DPS", tenureMonths: 12, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://ificbank.com.bd/public/islamic/Latest-Deposit-Rate-Islamic-16-08-2026.pdf" },

  // --- Southeast Bank, Sonali Bank, Rupali Bank, NCC Bank, Pubali Bank ---
  // No Islamic FDR/DPS rate entries. Each confirmed during 2026-08-31/
  // 2026-09-01 research to have no clearly published, tenure-itemized
  // provisional profit rate for their Islamic banking window:
  //   - Southeast Bank: product pages (MTDR/MMSS) publish no rate table at
  //     all ("contact nearest branch"); the bank's full deposit-rate PDF
  //     only shows a dual-branded "Esteem Mudaraba" scheme, not the
  //     standard MTDR/MMSS products, so not used.
  //   - Rupali Bank: Islamic banking rate page is inaccessible to automated
  //     fetching (unrenderable / 403) -- needs a human to open it in a real
  //     browser before any number is entered.
  //   - Sonali Bank: no percentage rate published (see ratioEntries below --
  //     its real, sourced profit-SHARING RATIO is entered as a
  //     ProfitSharingRatio, never as a fabricated interestRatePct).
  //   - NCC Bank, Pubali Bank: Islamic banking pages list product names
  //     only (Pubali's site additionally Cloudflare-blocks all automated
  //     access, confirmed again 2026-09-01), no rate figures published
  //     anywhere found. Eastern Bank (EBL), Jamuna Bank, and United
  //     Commercial Bank all moved to real rate entries above -- no longer
  //     shells.
  //   - Dhaka Bank's Mudaraba DPS product (separate from the FDR entries
  //     above): the bank publishes only an 8.50%-10.00% range, no per-
  //     tenure table, but does show a maturity-value grid across
  //     2/3/4/5/6/7/8/10-year tenures. Attempted the same back-solve-from-
  //     maturity-grid technique successfully used elsewhere in this file,
  //     but the implied rates came out non-monotonic and noisy (9.44%,
  //     9.16%, 9.03%, 9.90%, 9.37%, 8.86%, 8.59%, 8.32% -- jumping up and
  //     down rather than trending with tenure), unlike the earlier clean
  //     back-solve. That inconsistency means the grid isn't a simple flat-
  //     rate-per-tenure annuity, so forcing a computed number in would
  //     fabricate precision the source doesn't support -- left as a shell.
];

const ratioEntries: RatioEntry[] = [
  // --- Sonali Bank — মুদারাবা মেয়াদী জমা হিসাব (Mudaraba Term Deposit) ---
  // https://www.sonalibank.com.bd/PDF_file/islami_banking/islami_banking_overview.pdf
  // No percentage rate is published; only the customer:bank profit-sharing
  // ratio, which scales up with tenure. Read directly from the bank's own
  // PDF (fetched 2026-09-01) since the site's in-page PDF viewer fails to
  // render (net::ERR_ABORTED) -- confirmed via direct curl of the PDF URL.
  { institutionName: "Sonali Bank", productType: "FDR", productNameHint: "Mudaraba FDR", tenureMonths: 3, customerRatio: 50, bankRatio: 50, sourceUrl: "https://www.sonalibank.com.bd/PDF_file/islami_banking/islami_banking_overview.pdf" },
  { institutionName: "Sonali Bank", productType: "FDR", productNameHint: "Mudaraba FDR", tenureMonths: 6, customerRatio: 60, bankRatio: 40, sourceUrl: "https://www.sonalibank.com.bd/PDF_file/islami_banking/islami_banking_overview.pdf" },
  { institutionName: "Sonali Bank", productType: "FDR", productNameHint: "Mudaraba FDR", tenureMonths: 12, customerRatio: 65, bankRatio: 35, sourceUrl: "https://www.sonalibank.com.bd/PDF_file/islami_banking/islami_banking_overview.pdf" },
  { institutionName: "Sonali Bank", productType: "FDR", productNameHint: "Mudaraba FDR", tenureMonths: 24, customerRatio: 68, bankRatio: 32, sourceUrl: "https://www.sonalibank.com.bd/PDF_file/islami_banking/islami_banking_overview.pdf" },
  { institutionName: "Sonali Bank", productType: "FDR", productNameHint: "Mudaraba FDR", tenureMonths: 36, customerRatio: 70, bankRatio: 30, sourceUrl: "https://www.sonalibank.com.bd/PDF_file/islami_banking/islami_banking_overview.pdf" },
];

/** Shared shape RateEntry and RatioEntry both satisfy (as literal unions, not widened to string). */
type ResolvableEntry = Pick<RateEntry, "institutionName" | "productType" | "productNameHint">;

/**
 * Resolves an entry's institution/product, given the name + productType +
 * optional productNameHint every entry shape (RateEntry, RatioEntry) shares.
 * Read-only — safe to run outside a transaction. Generic over the entry type
 * so callers keep RateEntry/RatioEntry's literal-union `productType` typing
 * instead of widening it to a plain `string` (which would let a typo'd or
 * stale productType value type-check here and only fail at runtime).
 */
async function resolveProduct<T extends ResolvableEntry>(
  entry: T
): Promise<{ productId: string } | { error: "no-institution" | "no-product" }> {
  // orderBy: createdAt makes an ambiguous match (e.g. two FDR products at
  // one institution with a productNameHint too broad to disambiguate)
  // deterministic across runs instead of whatever order Postgres happens to
  // return rows in -- doesn't prevent a genuinely ambiguous entry from
  // resolving to the wrong product, but does mean re-running the script
  // never silently flips which one it picks.
  const institution = await prisma.institution.findFirst({
    where: { name: entry.institutionName },
    orderBy: { createdAt: "asc" },
  });
  if (!institution) return { error: "no-institution" };

  const product = await prisma.rateProduct.findFirst({
    where: {
      institutionId: institution.id,
      productType: entry.productType,
      ...(entry.productNameHint ? { name: { contains: entry.productNameHint } } : {}),
    },
    orderBy: { createdAt: "asc" },
  });
  if (!product) return { error: "no-product" };

  return { productId: product.id };
}

/**
 * Resolves every entry to its productId (read-only), grouped by product so
 * each product's replacement can run as one atomic transaction — see
 * `importByProduct`'s comment for why this matters. Shared by both the
 * RateEntry and RatioEntry passes so the resolve/group logic (and any future
 * fix to it) exists in exactly one place.
 */
async function groupByProduct<T extends ResolvableEntry>(
  entries: T[],
  label: string
): Promise<Map<string, T[]>> {
  const byProduct = new Map<string, T[]>();
  let skippedNoInstitution = 0;
  let skippedNoProduct = 0;

  for (const entry of entries) {
    const resolved = await resolveProduct(entry);
    if ("error" in resolved) {
      if (resolved.error === "no-institution") {
        console.warn(`SKIP${label}: institution not found: ${entry.institutionName}`);
        skippedNoInstitution++;
      } else {
        console.warn(`SKIP${label}: product not found: ${entry.institutionName} / ${entry.productType} ${entry.productNameHint ?? ""}`);
        skippedNoProduct++;
      }
      continue;
    }
    const list = byProduct.get(resolved.productId) ?? [];
    list.push(entry);
    byProduct.set(resolved.productId, list);
  }

  if (skippedNoInstitution || skippedNoProduct) {
    console.log(`Skipped${label}: ${skippedNoInstitution} (no institution match), ${skippedNoProduct} (no product match).`);
  }
  return byProduct;
}

/**
 * Replaces each product's rows with a fresh set, one atomic transaction per
 * product. Previously this was delete, then N separate creates, all as
 * un-batched round trips -- if the script crashed or the pooled connection
 * dropped between the delete and its creates (this has happened twice in
 * production against Supabase's pgbouncer), that product was left with its
 * old rows gone and only some/none of the new ones inserted: a live gap on
 * the public site until manually restored. A failure partway through this
 * function now rolls only the current product back to its pre-run state --
 * never a partial one -- and products not yet reached are simply unaffected.
 */
async function importByProduct<T>(
  byProduct: Map<string, T[]>,
  deleteFor: (productId: string) => Prisma.PrismaPromise<unknown>,
  createFor: (productId: string, entry: T) => Prisma.PrismaPromise<unknown>
): Promise<number> {
  let created = 0;
  let processed = 0;
  for (const [productId, productEntries] of byProduct) {
    try {
      await prisma.$transaction([
        deleteFor(productId),
        ...productEntries.map((entry) => createFor(productId, entry)),
      ]);
    } catch (err) {
      // Deliberately fail fast rather than skip and continue: a transaction
      // failure here (e.g. a duplicate tenureMonths within one product's
      // entries) usually means the source data itself has a real problem
      // worth stopping to look at, not something safe to silently work
      // around. But say exactly which product and how many were never
      // reached, since every already-committed product's transaction stays
      // committed (this loop's per-product atomicity is unaffected) and
      // it's safe to fix the bad entry and simply re-run the whole script.
      const remaining = byProduct.size - processed - 1;
      console.error(
        `FAILED on product ${productId} (${processed + 1} of ${byProduct.size} attempted, ` +
          `${created} tiers already committed for earlier products, ${remaining} product(s) never reached):`
      );
      throw err;
    }
    created += productEntries.length;
    processed++;
  }
  return created;
}

/**
 * Clears MANUAL rate tiers belonging to products this file no longer lists.
 *
 * `importByProduct` only deletes-then-recreates for products that appear in
 * `entries`, so DELETING a product's rows from this file used to leave its old
 * tiers orphaned in the database forever -- the import would report success
 * while the site kept serving numbers with no source behind them. That is the
 * worst possible failure mode for a no-fabrication project, and it is silent.
 *
 * Caught for real on 2026-09-18: Trust Bank's conventional DPS rows were
 * removed (the bank stopped publishing a DPS rate table), yet four 9.50%
 * tiers stayed live in the database through a full import run.
 */
async function clearOrphanedManualTiers(keepProductIds: Set<string>): Promise<number> {
  const orphaned = await prisma.rateTier.findMany({
    where: { source: "MANUAL", productId: { notIn: Array.from(keepProductIds) } },
    select: { id: true, productId: true },
  });
  if (orphaned.length === 0) return 0;

  const byProduct = new Map<string, number>();
  for (const t of orphaned) byProduct.set(t.productId, (byProduct.get(t.productId) ?? 0) + 1);
  for (const [productId, count] of byProduct) {
    const product = await prisma.rateProduct.findUnique({
      where: { id: productId },
      select: { name: true, institution: { select: { name: true } } },
    });
    console.warn(
      `ORPHANED: clearing ${count} MANUAL tier(s) for ${product?.institution.name ?? "?"} / ${product?.name ?? productId} — no longer listed in this file.`
    );
  }
  await prisma.rateTier.deleteMany({
    where: { source: "MANUAL", productId: { notIn: Array.from(keepProductIds) } },
  });
  return orphaned.length;
}

async function main() {
  const byProduct = await groupByProduct(entries, "");
  const created = await importByProduct(
    byProduct,
    (productId) => prisma.rateTier.deleteMany({ where: { productId, source: "MANUAL" } }),
    (productId, entry) =>
      prisma.rateTier.create({
        data: {
          productId,
          tenureMonths: entry.tenureMonths,
          minAmount: entry.minAmount,
          maxAmount: entry.maxAmount ?? null,
          interestRatePct: entry.interestRatePct,
          source: "MANUAL",
          sourceUrl: entry.sourceUrl,
        },
      })
  );
  console.log(`Imported ${created} rate tiers across ${byProduct.size} products.`);

  const orphaned = await clearOrphanedManualTiers(new Set(byProduct.keys()));
  if (orphaned > 0) {
    console.log(`Cleared ${orphaned} orphaned MANUAL rate tier(s) (see ORPHANED warnings above).`);
  }

  const byRatioProduct = await groupByProduct(ratioEntries, " (ratio)");
  const ratiosCreated = await importByProduct(
    byRatioProduct,
    (productId) => prisma.profitSharingRatio.deleteMany({ where: { productId } }),
    (productId, entry) =>
      prisma.profitSharingRatio.create({
        data: {
          productId,
          tenureMonths: entry.tenureMonths,
          customerRatio: entry.customerRatio,
          bankRatio: entry.bankRatio,
          sourceUrl: entry.sourceUrl,
        },
      })
  );
  console.log(`Imported ${ratiosCreated} profit-sharing ratios across ${byRatioProduct.size} products.`);

  // Dhaka Bank's DPS rates were back-solved assuming monthly-compounded annuity
  // math (see the comment above those entries) — set the product's compounding
  // to match, so the calculator reproduces the bank's own published chart exactly.
  const dhakaBank = await prisma.institution.findFirst({ where: { name: "Dhaka Bank" } });
  if (dhakaBank) {
    await prisma.rateProduct.updateMany({
      where: { institutionId: dhakaBank.id, productType: "DPS" },
      data: { compounding: "MONTHLY" },
    });
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
