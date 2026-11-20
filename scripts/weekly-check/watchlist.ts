// Pages where a bank links its CURRENT rate document. The 2026-11-11 sweep
// found that the usual failure is not a dead link but a still-working old one:
// the bank posts a new PDF and the stored URL keeps returning the superseded
// sheet. Each entry says where the bank lists its current document and how to
// recognise it; the check flags any match that is not already a sourceUrl in
// scripts/import-real-rates.ts.
//
// `pick` says which matches count as "current":
//   - "all":    the page only ever links the current document(s)
//   - "first":  the source lists newest first (e.g. a WordPress media query)
//   - "latest": the page keeps history; the current one sorts last by name
//               (date- or timestamp-prefixed filenames)
// Relative matches resolve against the site root, not the page path: UCB and
// Islami Bank both write root-relative hrefs without a leading slash.

export interface ListingWatch {
  institution: string;
  page: string;
  pattern: RegExp;
  pick: "all" | "first" | "latest";
}

export const listingWatches: ListingWatch[] = [
  {
    institution: "BRAC Bank",
    page: "https://www.bracbank.com/en/page/deposit-interest-rate",
    pattern: /https?:\\?\/\\?\/brackweb[^"'\s<>]*BRAC_Bank_Deposit_Interest_Rate[^"'\s<>]*?\.pdf/g,
    pick: "all",
  },
  {
    institution: "United Commercial Bank",
    page: "https://www.ucb.com.bd/rates/interest-rates/",
    pattern: /reports\/interest-rates\/(?:instruction-circular[^"'<>]*|ucb-islamic-rate-sheet-[a-z]+-\d{4})\.pdf/g,
    pick: "all",
  },
  {
    institution: "Dhaka Bank",
    page: "https://dhakabank.com.bd/wp-json/wp/v2/media?search=deposit%20rate&per_page=5&orderby=date&order=desc&_fields=source_url",
    pattern: /https:\\?\/\\?\/dhakabank\.com\.bd\\?\/wp-content\\?\/uploads\\?\/[^"]*\.pdf/g,
    pick: "first",
  },
  {
    institution: "Mutual Trust Bank (Islamic)",
    page: "https://www.mutualtrustbank.com/mtb-yaqeen/",
    pattern: /https:\/\/www\.mutualtrustbank\.com\/wp-content\/uploads\/[^"'<>]*Profit-on-Deposit[^"'<>]*\.pdf/g,
    pick: "all",
  },
  {
    institution: "Jamuna Bank",
    page: "https://jamunabankbd.com/interest-rate/",
    pattern: /https:\/\/jamunabankbd\.com\/wp-content\/uploads\/[^"'<>]*Jamuna_Bank_(?:Deposit_Schemes|CASA_SND_FDR)[^"'<>]*\.pdf/g,
    pick: "all",
  },
  {
    institution: "Prime Bank",
    page: "https://www.primebank.com.bd/interest-or-profit-rates",
    pattern: /https:\/\/www\.primebank\.com\.bd\/assets\/interest-rate\/[^"'<>]*(?:Interest_Rate_Conventional|Provisional_Profit_Rate_Islamic)[^"'<>]*\.pdf/g,
    pick: "all",
  },
  {
    institution: "Eastern Bank",
    page: "https://www.ebl.com.bd/retail-deposit/EBL-FD",
    pattern: /https:\/\/www\.ebl\.com\.bd\/(?:\.\/)?assets\/home\/interest\/Deposit_Rate_sheet[^"'<>]*\.pdf/g,
    pick: "all",
  },
  {
    institution: "NCC Bank",
    page: "https://www.nccbank.com.bd/NccbRates",
    pattern: /https:\/\/www\.nccbank\.com\.bd\/assets\/files\/rates_files\/Deposit_rate_chart[^"'<>]*\.pdf/g,
    pick: "all",
  },
  {
    institution: "Janata Bank",
    page: "https://www.jb.com.bd/products/rate_of_interest",
    pattern: /https:\/\/www\.jb\.com\.bd\/assets\/file\/documents\/term_deposit_[\d_\-apm]+\.pdf/g,
    pick: "latest",
  },
  {
    institution: "Islami Bank Bangladesh",
    page: "https://www.islamibankbd.com/profit-rates-on-deposits",
    pattern: /public\/assets\/profit-rate-main\/\d{10}_Provisional Profit rates w\.e\.f[^"'<>]*\.pdf/g,
    pick: "latest",
  },
];

// JSON endpoints whose rate payload is fingerprinted alongside the source URLs
// (the page the app cites renders this data client-side, so the page's own HTML
// carries no rates).
export const extraFingerprintTargets: { label: string; url: string }[] = [
  { label: "IDLC Finance (rates API)", url: "https://web.idlc.com/api/v1/get-deposit-term?shortcode=TermDeposit" },
];

// The live site's public pages. `rates`: the server-rendered HTML should
// contain rate figures (compare/calculator fill theirs in the browser).
export const sitePages: { path: string; rates: boolean }[] = [
  { path: "/", rates: true },
  { path: "/compare", rates: false },
  { path: "/calculator", rates: false },
  { path: "/insights", rates: true },
  { path: "/insights?mode=islamic", rates: true },
];
