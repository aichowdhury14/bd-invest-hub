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
  { institutionName: "Dutch-Bangla Bank", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 9.5, sourceUrl: "https://www.dutchbanglabank.com/depositsadv/term-deposit.html" },

  // --- BRAC Bank --- Retail Monthly Interest FD (FRABR) + FRFLX DPS
  { institutionName: "BRAC Bank", productType: "FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://bracbank.com/en/page/deposit-interest-rate" },
  { institutionName: "BRAC Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://bracbank.com/en/page/deposit-interest-rate" },
  { institutionName: "BRAC Bank", productType: "FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://bracbank.com/en/page/deposit-interest-rate" },
  { institutionName: "BRAC Bank", productType: "FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://bracbank.com/en/page/deposit-interest-rate" },
  { institutionName: "BRAC Bank", productType: "DPS", tenureMonths: 12, minAmount: 0, interestRatePct: 8.5, sourceUrl: "https://bracbank.com/en/page/deposit-interest-rate" },
  { institutionName: "BRAC Bank", productType: "DPS", tenureMonths: 24, minAmount: 0, interestRatePct: 8.75, sourceUrl: "https://bracbank.com/en/page/deposit-interest-rate" },
  { institutionName: "BRAC Bank", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://bracbank.com/en/page/deposit-interest-rate" },

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
  { institutionName: "Eastern Bank", productType: "DPS", tenureMonths: 12, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },
  { institutionName: "Eastern Bank", productType: "DPS", tenureMonths: 24, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },
  { institutionName: "Eastern Bank", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },
  { institutionName: "Eastern Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },
  { institutionName: "Eastern Bank", productType: "DPS", tenureMonths: 84, minAmount: 0, interestRatePct: 8.75, sourceUrl: "https://www.ebl.com.bd/retail-deposit/EBL-FD" },

  // --- Prime Bank --- Prime Fixed Deposit + Prime Kotipoti DPS
  { institutionName: "Prime Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 7.0, sourceUrl: "https://www.primebank.com.bd/interest-or-profit-rates" },
  { institutionName: "Prime Bank", productType: "FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 8.75, sourceUrl: "https://www.primebank.com.bd/interest-or-profit-rates" },
  { institutionName: "Prime Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.primebank.com.bd/interest-or-profit-rates" },
  { institutionName: "Prime Bank", productType: "FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://www.primebank.com.bd/interest-or-profit-rates" },
  { institutionName: "Prime Bank", productType: "FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 8.0, sourceUrl: "https://www.primebank.com.bd/interest-or-profit-rates" },
  { institutionName: "Prime Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.primebank.com.bd/interest-or-profit-rates" },
  { institutionName: "Prime Bank", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.primebank.com.bd/interest-or-profit-rates" },

  // --- Dhaka Bank --- Special FD (SME/Corp) tenures
  { institutionName: "Dhaka Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://dhakabank.com.bd/wp-content/uploads/2026/08/Deposit-Rate-Effective-from-Aug-06-2026.pdf" },
  { institutionName: "Dhaka Bank", productType: "FDR", tenureMonths: 6, minAmount: 0, interestRatePct: 8.75, sourceUrl: "https://dhakabank.com.bd/wp-content/uploads/2026/08/Deposit-Rate-Effective-from-Aug-06-2026.pdf" },
  { institutionName: "Dhaka Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 8.75, sourceUrl: "https://dhakabank.com.bd/wp-content/uploads/2026/08/Deposit-Rate-Effective-from-Aug-06-2026.pdf" },
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
  { institutionName: "NCC Bank", productType: "DPS", tenureMonths: 24, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.nccbank.com.bd/assets/files/rates_files/Deposit_Rates.pdf" },
  { institutionName: "NCC Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.nccbank.com.bd/assets/files/rates_files/Deposit_Rates.pdf" },
  { institutionName: "NCC Bank", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.nccbank.com.bd/assets/files/rates_files/Deposit_Rates.pdf" },

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
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, maxAmount: 1 * LAC, interestRatePct: 9.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 3, minAmount: 1 * LAC, maxAmount: 5 * LAC, interestRatePct: 9.5, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 3, minAmount: 5 * LAC, maxAmount: 20 * LAC, interestRatePct: 9.5, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 3, minAmount: 20 * LAC, maxAmount: 50 * LAC, interestRatePct: 9.75, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 3, minAmount: 50 * LAC, interestRatePct: 10.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, maxAmount: 1 * LAC, interestRatePct: 9.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 12, minAmount: 1 * LAC, maxAmount: 5 * LAC, interestRatePct: 9.5, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "FDR", tenureMonths: 12, minAmount: 5 * LAC, interestRatePct: 10.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "DPS", tenureMonths: 12, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },
  { institutionName: "IFIC Bank", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf" },

  // --- United Commercial Bank (UCB) --- UEPFD (Earning Plus FD, quarterly-payout
  // column) + Super Flex DPS. UEPFD explicitly states tenor "1 to 10 years."
  { institutionName: "United Commercial Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.ucb.com.bd/banking/retail-banking/ucb-earning-plus-fixed-deposit-uepfd/" },
  { institutionName: "United Commercial Bank", productType: "FDR", tenureMonths: 24, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.ucb.com.bd/banking/retail-banking/ucb-earning-plus-fixed-deposit-uepfd/" },
  { institutionName: "United Commercial Bank", productType: "FDR", tenureMonths: 36, minAmount: 0, interestRatePct: 10.0, sourceUrl: "https://www.ucb.com.bd/banking/retail-banking/ucb-earning-plus-fixed-deposit-uepfd/" },
  { institutionName: "United Commercial Bank", productType: "FDR", tenureMonths: 48, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://www.ucb.com.bd/banking/retail-banking/ucb-earning-plus-fixed-deposit-uepfd/" },
  { institutionName: "United Commercial Bank", productType: "FDR", tenureMonths: 60, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://www.ucb.com.bd/banking/retail-banking/ucb-earning-plus-fixed-deposit-uepfd/" },
  { institutionName: "United Commercial Bank", productType: "FDR", tenureMonths: 84, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://www.ucb.com.bd/banking/retail-banking/ucb-earning-plus-fixed-deposit-uepfd/" },
  { institutionName: "United Commercial Bank", productType: "FDR", tenureMonths: 120, minAmount: 0, interestRatePct: 8.25, sourceUrl: "https://www.ucb.com.bd/banking/retail-banking/ucb-earning-plus-fixed-deposit-uepfd/" },
  // Super Flex DPS: the page gives only a maturity-VALUE example (one deposit
  // amount per tenure, not several), so this is back-solved from a single data
  // point per tenure — lower confidence than Dhaka Bank's DPS (which had 3
  // amounts per tenure to cross-check). Regular-customer rates used (not the
  // senior-citizen preferential tier).
  { institutionName: "United Commercial Bank", productType: "DPS", tenureMonths: 12, minAmount: 0, interestRatePct: 11.2, sourceUrl: "ucb-superflex-dps-maturity-example (back-solved, single data point, lower confidence)" },
  { institutionName: "United Commercial Bank", productType: "DPS", tenureMonths: 24, minAmount: 0, interestRatePct: 10.3, sourceUrl: "ucb-superflex-dps-maturity-example (back-solved, single data point, lower confidence)" },
  { institutionName: "United Commercial Bank", productType: "DPS", tenureMonths: 36, minAmount: 0, interestRatePct: 10.28, sourceUrl: "ucb-superflex-dps-maturity-example (back-solved, single data point, lower confidence)" },
  { institutionName: "United Commercial Bank", productType: "DPS", tenureMonths: 60, minAmount: 0, interestRatePct: 10.31, sourceUrl: "ucb-superflex-dps-maturity-example (back-solved, single data point, lower confidence)" },
  { institutionName: "United Commercial Bank", productType: "DPS", tenureMonths: 120, minAmount: 0, interestRatePct: 10.14, sourceUrl: "ucb-superflex-dps-maturity-example (back-solved, single data point, lower confidence)" },

  // --- Jamuna Bank --- Monthly Savings Scheme DPS (from official "Deposit
  // Schemes" PDF, cross-validated at two deposit amounts per tenure — clean fit).
  // FDR/MTDR is NOT entered: the bank's only FDR sheet publishes a negotiated
  // RANGE (7.00-11.00% for 3mo, 7.00-10.50% for 6/12mo), not a specific
  // advertised rate, and no tenure beyond 12 months is published at all — same
  // reasoning as Standard Chartered's exclusion.
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

  // --- The City Bank --- fetched via rendering proxy (JS-only SPA, no static HTML); no effective date stated on page, verified live 2026-08-28
  { institutionName: "The City Bank", productType: "FDR", tenureMonths: 3, minAmount: 0, maxAmount: 50 * LAC, interestRatePct: 8.0, sourceUrl: "https://www.citybankplc.com/gsi/conventional-banking-products" },
  { institutionName: "The City Bank", productType: "FDR", tenureMonths: 3, minAmount: 50 * LAC, maxAmount: 1 * CRORE, interestRatePct: 8.0, sourceUrl: "https://www.citybankplc.com/gsi/conventional-banking-products" },
  { institutionName: "The City Bank", productType: "FDR", tenureMonths: 3, minAmount: 1 * CRORE, maxAmount: 5 * CRORE, interestRatePct: 8.25, sourceUrl: "https://www.citybankplc.com/gsi/conventional-banking-products" },
  { institutionName: "The City Bank", productType: "FDR", tenureMonths: 12, minAmount: 0, maxAmount: 1 * CRORE, interestRatePct: 8.25, sourceUrl: "https://www.citybankplc.com/gsi/conventional-banking-products" },
  { institutionName: "The City Bank", productType: "FDR", tenureMonths: 24, minAmount: 0, maxAmount: 1 * CRORE, interestRatePct: 8.25, sourceUrl: "https://www.citybankplc.com/gsi/conventional-banking-products" },
  { institutionName: "The City Bank", productType: "FDR", tenureMonths: 36, minAmount: 0, maxAmount: 1 * CRORE, interestRatePct: 8.25, sourceUrl: "https://www.citybankplc.com/gsi/conventional-banking-products" },
  { institutionName: "The City Bank", productType: "DPS", tenureMonths: 6, minAmount: 0, interestRatePct: 8.5, sourceUrl: "https://www.citybankplc.com/gsi/conventional-banking-products" },
  { institutionName: "The City Bank", productType: "DPS", tenureMonths: 12, minAmount: 0, interestRatePct: 8.5, sourceUrl: "https://www.citybankplc.com/gsi/conventional-banking-products" },
  { institutionName: "The City Bank", productType: "DPS", tenureMonths: 48, minAmount: 0, interestRatePct: 9.0, sourceUrl: "https://www.citybankplc.com/gsi/conventional-banking-products" },

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
