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

import { PrismaClient } from "@prisma/client";

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

  // --- BRAC Bank --- Retail Monthly Interest FD (FRABR) + FRFLX DPS. Cross-checked
  // 2026-08-29 against ALCO Circular 2026/07 (effective Aug 25, 2026) — every rate
  // below confirmed unchanged; only the source is updated, from the general rate
  // page to this specific dated circular for a more precise audit trail.
  // FRABR published tenures: 6/12/14/18/24/36/60/84mo (6mo@8.00%, rest@8.25%)
  { institutionName: "BRAC Bank", productType: "FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_w.e.f._August_25,_20266a8acd8867c0f.pdf" },
  { institutionName: "BRAC Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_w.e.f._August_25,_20266a8acd8867c0f.pdf" },
  { institutionName: "BRAC Bank", productType: "FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_w.e.f._August_25,_20266a8acd8867c0f.pdf" },
  { institutionName: "BRAC Bank", productType: "FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_w.e.f._August_25,_20266a8acd8867c0f.pdf" },
  { institutionName: "BRAC Bank", productType: "FDR", tenureMonths: 60, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_w.e.f._August_25,_20266a8acd8867c0f.pdf" },
  { institutionName: "BRAC Bank", productType: "FDR", tenureMonths: 84, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_w.e.f._August_25,_20266a8acd8867c0f.pdf" },
  // FRFLX DPS is banded by completed year, not tenure-locked: Yr1 8.50%, Yr2 8.75%,
  // Yr3-10 flat 9.00% (confirmed the scheme runs open-ended to 10 years at 9.00%)
  { institutionName: "BRAC Bank", productType: "DPS", tenureMonths: 12, minAmount: 0, interestRatePct: 8.5, sourceUrl: "https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_w.e.f._August_25,_20266a8acd8867c0f.pdf" },
  { institutionName: "BRAC Bank", productType: "DPS", tenureMonths: 24, minAmount: 0, interestRatePct: 8.75, sourceUrl: "https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_w.e.f._August_25,_20266a8acd8867c0f.pdf" },
  { institutionName: "BRAC Bank", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_w.e.f._August_25,_20266a8acd8867c0f.pdf" },
  { institutionName: "BRAC Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_w.e.f._August_25,_20266a8acd8867c0f.pdf" },
  { institutionName: "BRAC Bank", productType: "DPS", tenureMonths: 84, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_w.e.f._August_25,_20266a8acd8867c0f.pdf" },
  { institutionName: "BRAC Bank", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_w.e.f._August_25,_20266a8acd8867c0f.pdf" },

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
  { institutionName: "Dhaka Bank", productType: "FDR", tenureMonths: 1, minAmount: 0, interestRatePct: 4.0, sourceUrl: "https://dhakabank.com.bd/wp-content/uploads/2026/08/Deposit-Rate-Effective-from-Aug-06-2026.pdf" },
  { institutionName: "Dhaka Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 7.75, sourceUrl: "https://dhakabank.com.bd/wp-content/uploads/2026/08/Deposit-Rate-Effective-from-Aug-06-2026.pdf" },
  { institutionName: "Dhaka Bank", productType: "FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://dhakabank.com.bd/wp-content/uploads/2026/08/Deposit-Rate-Effective-from-Aug-06-2026.pdf" },
  { institutionName: "Dhaka Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://dhakabank.com.bd/wp-content/uploads/2026/08/Deposit-Rate-Effective-from-Aug-06-2026.pdf" },
  { institutionName: "Dhaka Bank", productType: "FDR", tenureMonths: 18, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://dhakabank.com.bd/wp-content/uploads/2026/08/Deposit-Rate-Effective-from-Aug-06-2026.pdf" },
  { institutionName: "Dhaka Bank", productType: "FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://dhakabank.com.bd/wp-content/uploads/2026/08/Deposit-Rate-Effective-from-Aug-06-2026.pdf" },
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
  { institutionName: "Bank Asia", productType: "FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://www.bankasia-bd.com/other/interestrates" },
  { institutionName: "Bank Asia", productType: "FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 8.5, sourceUrl: "https://www.bankasia-bd.com/other/interestrates" },
  { institutionName: "Bank Asia", productType: "FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://www.bankasia-bd.com/other/interestrates" },
  { institutionName: "Bank Asia", productType: "FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://www.bankasia-bd.com/other/interestrates" },
  { institutionName: "Bank Asia", productType: "FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://www.bankasia-bd.com/other/interestrates" },
  // DPS+ (ডিপিএস+), effective from 01 Feb 2026 per the brochure
  { institutionName: "Bank Asia", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 9.81, sourceUrl: "https://www.bankasia-bd.com/downloads/Bank_Asia_DPS_Brochure.pdf" },
  { institutionName: "Bank Asia", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 9.96, sourceUrl: "https://www.bankasia-bd.com/downloads/Bank_Asia_DPS_Brochure.pdf" },
  { institutionName: "Bank Asia", productType: "DPS", tenureMonths: 84, minAmount: 0, interestRatePct: 9.15, sourceUrl: "https://www.bankasia-bd.com/downloads/Bank_Asia_DPS_Brochure.pdf" },
  { institutionName: "Bank Asia", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 9.27, sourceUrl: "https://www.bankasia-bd.com/downloads/Bank_Asia_DPS_Brochure.pdf" },
  { institutionName: "Bank Asia", productType: "DPS", tenureMonths: 144, minAmount: 0, interestRatePct: 9.34, sourceUrl: "https://www.bankasia-bd.com/downloads/Bank_Asia_DPS_Brochure.pdf" },

  // --- Trust Bank --- base FDR (tiered) + Trust Smart Savers DPS
  { institutionName: "Trust Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, maxAmount: 50 * LAC, interestRatePct: 7.75, sourceUrl: "https://www.tblbd.com/rates-and-charges/deposit-rates" },
  { institutionName: "Trust Bank", productType: "FDR", tenureMonths: 3, minAmount: 50 * LAC, maxAmount: 1 * CRORE, interestRatePct: 8.0, sourceUrl: "https://www.tblbd.com/rates-and-charges/deposit-rates" },
  { institutionName: "Trust Bank", productType: "FDR", tenureMonths: 3, minAmount: 1 * CRORE, maxAmount: 5 * CRORE, interestRatePct: 8.25, sourceUrl: "https://www.tblbd.com/rates-and-charges/deposit-rates" },
  { institutionName: "Trust Bank", productType: "FDR", tenureMonths: 3, minAmount: 5 * CRORE, interestRatePct: 8.5, sourceUrl: "https://www.tblbd.com/rates-and-charges/deposit-rates" },
  { institutionName: "Trust Bank", productType: "FDR", tenureMonths: 6, minAmount: 0, maxAmount: 50 * LAC, interestRatePct: 7.75, sourceUrl: "https://www.tblbd.com/rates-and-charges/deposit-rates" },
  { institutionName: "Trust Bank", productType: "FDR", tenureMonths: 6, minAmount: 50 * LAC, maxAmount: 1 * CRORE, interestRatePct: 8.0, sourceUrl: "https://www.tblbd.com/rates-and-charges/deposit-rates" },
  { institutionName: "Trust Bank", productType: "FDR", tenureMonths: 6, minAmount: 1 * CRORE, maxAmount: 5 * CRORE, interestRatePct: 8.25, sourceUrl: "https://www.tblbd.com/rates-and-charges/deposit-rates" },
  { institutionName: "Trust Bank", productType: "FDR", tenureMonths: 6, minAmount: 5 * CRORE, interestRatePct: 8.5, sourceUrl: "https://www.tblbd.com/rates-and-charges/deposit-rates" },
  { institutionName: "Trust Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, maxAmount: 50 * LAC, interestRatePct: 7.75, sourceUrl: "https://www.tblbd.com/rates-and-charges/deposit-rates" },
  { institutionName: "Trust Bank", productType: "FDR", tenureMonths: 12, minAmount: 50 * LAC, maxAmount: 1 * CRORE, interestRatePct: 8.0, sourceUrl: "https://www.tblbd.com/rates-and-charges/deposit-rates" },
  { institutionName: "Trust Bank", productType: "FDR", tenureMonths: 12, minAmount: 1 * CRORE, maxAmount: 5 * CRORE, interestRatePct: 8.25, sourceUrl: "https://www.tblbd.com/rates-and-charges/deposit-rates" },
  { institutionName: "Trust Bank", productType: "FDR", tenureMonths: 12, minAmount: 5 * CRORE, interestRatePct: 8.5, sourceUrl: "https://www.tblbd.com/rates-and-charges/deposit-rates" },
  { institutionName: "Trust Bank", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.tblbd.com/rates-and-charges/deposit-rates" },
  { institutionName: "Trust Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.tblbd.com/rates-and-charges/deposit-rates" },
  { institutionName: "Trust Bank", productType: "DPS", tenureMonths: 84, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.tblbd.com/rates-and-charges/deposit-rates" },
  { institutionName: "Trust Bank", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.tblbd.com/rates-and-charges/deposit-rates" },

  // --- Southeast Bank --- Retail FDR (tiered) + Shohoz DPS
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, maxAmount: 10 * LAC, interestRatePct: 8.0, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC-June-07-2026.pdf" },
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 3, minAmount: 10 * LAC, maxAmount: 50 * LAC, interestRatePct: 8.25, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC-June-07-2026.pdf" },
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 3, minAmount: 50 * LAC, maxAmount: 1 * CRORE, interestRatePct: 8.75, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC-June-07-2026.pdf" },
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 3, minAmount: 1 * CRORE, maxAmount: 5 * CRORE, interestRatePct: 9.25, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC-June-07-2026.pdf" },
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 3, minAmount: 5 * CRORE, interestRatePct: 9.5, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC-June-07-2026.pdf" },
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 6, minAmount: 0, maxAmount: 10 * LAC, interestRatePct: 8.0, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC-June-07-2026.pdf" },
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 6, minAmount: 10 * LAC, maxAmount: 50 * LAC, interestRatePct: 8.25, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC-June-07-2026.pdf" },
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 6, minAmount: 50 * LAC, maxAmount: 1 * CRORE, interestRatePct: 8.75, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC-June-07-2026.pdf" },
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 6, minAmount: 1 * CRORE, maxAmount: 5 * CRORE, interestRatePct: 9.25, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC-June-07-2026.pdf" },
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 6, minAmount: 5 * CRORE, interestRatePct: 9.75, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC-June-07-2026.pdf" },
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, maxAmount: 10 * LAC, interestRatePct: 8.25, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC-June-07-2026.pdf" },
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 12, minAmount: 10 * LAC, maxAmount: 50 * LAC, interestRatePct: 8.5, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC-June-07-2026.pdf" },
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 12, minAmount: 50 * LAC, maxAmount: 1 * CRORE, interestRatePct: 9.0, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC-June-07-2026.pdf" },
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 12, minAmount: 1 * CRORE, maxAmount: 5 * CRORE, interestRatePct: 9.5, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC-June-07-2026.pdf" },
  { institutionName: "Southeast Bank", productType: "FDR", tenureMonths: 12, minAmount: 5 * CRORE, interestRatePct: 9.75, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC-June-07-2026.pdf" },
  { institutionName: "Southeast Bank", productType: "DPS", tenureMonths: 24, minAmount: 0, interestRatePct: 9.9248, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC-June-07-2026.pdf" },
  { institutionName: "Southeast Bank", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 9.3807, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC-June-07-2026.pdf" },
  { institutionName: "Southeast Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 9.1096, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC-June-07-2026.pdf" },
  { institutionName: "Southeast Bank", productType: "DPS", tenureMonths: 84, minAmount: 0, interestRatePct: 8.8391, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC-June-07-2026.pdf" },
  { institutionName: "Southeast Bank", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 8.5692, sourceUrl: "https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC-June-07-2026.pdf" },

  // --- IFIC Bank --- Term Deposit (tiered) + Aamar Bhobishawt DPS
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 1, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, maxAmount: 1 * LAC, interestRatePct: 9.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 3, minAmount: 1 * LAC, maxAmount: 5 * LAC, interestRatePct: 9.5, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 3, minAmount: 5 * LAC, maxAmount: 20 * LAC, interestRatePct: 9.5, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 3, minAmount: 20 * LAC, maxAmount: 50 * LAC, interestRatePct: 9.75, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 3, minAmount: 50 * LAC, interestRatePct: 10.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 6, minAmount: 0, maxAmount: 1 * LAC, interestRatePct: 9.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 6, minAmount: 1 * LAC, maxAmount: 5 * LAC, interestRatePct: 9.5, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 6, minAmount: 5 * LAC, maxAmount: 20 * LAC, interestRatePct: 9.75, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 6, minAmount: 20 * LAC, interestRatePct: 10.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, maxAmount: 1 * LAC, interestRatePct: 9.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 12, minAmount: 1 * LAC, maxAmount: 5 * LAC, interestRatePct: 9.5, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 12, minAmount: 5 * LAC, interestRatePct: 10.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 24, minAmount: 0, maxAmount: 1 * LAC, interestRatePct: 9.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 24, minAmount: 1 * LAC, maxAmount: 5 * LAC, interestRatePct: 9.5, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 24, minAmount: 5 * LAC, interestRatePct: 10.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 36, minAmount: 0, maxAmount: 1 * LAC, interestRatePct: 9.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 36, minAmount: 1 * LAC, maxAmount: 5 * LAC, interestRatePct: 9.5, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 36, minAmount: 5 * LAC, interestRatePct: 10.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "DPS", tenureMonths: 12, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },

  // --- United Commercial Bank (UCB) --- updated 2026-08-29 from UCB's official
  // Treasury rate circular #1632 (effective Aug 24, 2026), cross-checked against
  // the live product pages. Both flagship rates dropped since the last check:
  // Earning Plus FD (Regular, Quarterly payout, prefix 3428) 1-3yr fell from
  // 10.00% to 9.50% (4-10yr unchanged at 8.25%); Super Flex DPS's back-solved
  // estimate is replaced entirely with the circular's directly-published,
  // per-tenure rates (Regular customer group, prefixes 3550/3580/3581/3582) —
  // real numbers now, not an estimate from a single maturity example. Note: the
  // same circular explicitly lists the OLD "Retail UCB DPS Plus" product as
  // discontinued — confirmed Super Flex DPS (not DPS Plus) is UCB's current
  // general-retail recurring deposit product via its own product page.
  { institutionName: "United Commercial Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/instruction-circular-no1632full-deposit-productsucb-websi.pdf" },
  { institutionName: "United Commercial Bank", productType: "FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/instruction-circular-no1632full-deposit-productsucb-websi.pdf" },
  { institutionName: "United Commercial Bank", productType: "FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/instruction-circular-no1632full-deposit-productsucb-websi.pdf" },
  { institutionName: "United Commercial Bank", productType: "FDR", tenureMonths: 48, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/instruction-circular-no1632full-deposit-productsucb-websi.pdf" },
  { institutionName: "United Commercial Bank", productType: "FDR", tenureMonths: 60, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/instruction-circular-no1632full-deposit-productsucb-websi.pdf" },
  { institutionName: "United Commercial Bank", productType: "FDR", tenureMonths: 84, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/instruction-circular-no1632full-deposit-productsucb-websi.pdf" },
  { institutionName: "United Commercial Bank", productType: "FDR", tenureMonths: 120, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/instruction-circular-no1632full-deposit-productsucb-websi.pdf" },
  { institutionName: "United Commercial Bank", productType: "DPS", tenureMonths: 12, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/instruction-circular-no1632full-deposit-productsucb-websi.pdf" },
  { institutionName: "United Commercial Bank", productType: "DPS", tenureMonths: 24, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/instruction-circular-no1632full-deposit-productsucb-websi.pdf" },
  { institutionName: "United Commercial Bank", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 9.75, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/instruction-circular-no1632full-deposit-productsucb-websi.pdf" },
  { institutionName: "United Commercial Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/instruction-circular-no1632full-deposit-productsucb-websi.pdf" },
  { institutionName: "United Commercial Bank", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.ucb.com.bd/reports/interest-rates/instruction-circular-no1632full-deposit-productsucb-websi.pdf" },

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
  { institutionName: "Jamuna Bank", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://jamunabankbd.com/wp-content/uploads/2026/08/Rates-of-Deposit-Schemes_PP-1.pdf" },
  { institutionName: "Jamuna Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://jamunabankbd.com/wp-content/uploads/2026/08/Rates-of-Deposit-Schemes_PP-1.pdf" },
  { institutionName: "Jamuna Bank", productType: "DPS", tenureMonths: 96, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://jamunabankbd.com/wp-content/uploads/2026/08/Rates-of-Deposit-Schemes_PP-1.pdf" },
  { institutionName: "Jamuna Bank", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://jamunabankbd.com/wp-content/uploads/2026/08/Rates-of-Deposit-Schemes_PP-1.pdf" },

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
  { institutionName: "Uttara Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 8.5, sourceUrl: "https://www.uttarabank-bd.com/home/interestrate" },
  { institutionName: "Uttara Bank", productType: "FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 8.75, sourceUrl: "https://www.uttarabank-bd.com/home/interestrate" },
  { institutionName: "Uttara Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.uttarabank-bd.com/home/interestrate" },
  { institutionName: "Uttara Bank", productType: "FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.uttarabank-bd.com/home/interestrate" },
  { institutionName: "Uttara Bank", productType: "FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.uttarabank-bd.com/home/interestrate" },
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
];

async function main() {
  const touchedProductIds = new Set<string>();
  let created = 0;
  let skippedNoInstitution = 0;
  let skippedNoProduct = 0;

  for (const entry of entries) {
    const institution = await prisma.institution.findFirst({
      where: { name: entry.institutionName },
    });
    if (!institution) {
      console.warn(`SKIP: institution not found: ${entry.institutionName}`);
      skippedNoInstitution++;
      continue;
    }

    const product = await prisma.rateProduct.findFirst({
      where: {
        institutionId: institution.id,
        productType: entry.productType,
        ...(entry.productNameHint ? { name: { contains: entry.productNameHint } } : {}),
      },
    });
    if (!product) {
      console.warn(`SKIP: product not found: ${entry.institutionName} / ${entry.productType} ${entry.productNameHint ?? ""}`);
      skippedNoProduct++;
      continue;
    }

    // Clear this product's previously-imported MANUAL tiers exactly once per run,
    // right before inserting its first entry, so re-running the script is idempotent.
    if (!touchedProductIds.has(product.id)) {
      await prisma.rateTier.deleteMany({ where: { productId: product.id, source: "MANUAL" } });
      touchedProductIds.add(product.id);
    }

    await prisma.rateTier.create({
      data: {
        productId: product.id,
        tenureMonths: entry.tenureMonths,
        minAmount: entry.minAmount,
        maxAmount: entry.maxAmount ?? null,
        interestRatePct: entry.interestRatePct,
        source: "MANUAL",
        sourceUrl: entry.sourceUrl,
      },
    });
    created++;
  }

  console.log(`Imported ${created} rate tiers across ${touchedProductIds.size} products.`);
  if (skippedNoInstitution || skippedNoProduct) {
    console.log(`Skipped: ${skippedNoInstitution} (no institution match), ${skippedNoProduct} (no product match).`);
  }

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
