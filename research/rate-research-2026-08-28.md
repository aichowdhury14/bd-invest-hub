# Rate research — raw agent findings (2026-08-28)

This file is a scratch compilation of real, sourced rate research used to populate
the database via the admin panel or a one-off script. Every number here has a
source URL from the researching agent — do not use anything from this file that
lacks one. This file itself is not shipped as app data; it's the audit trail for
what actually got entered into the database.

Status: 1/5 research groups in (Group 2). Waiting on Group 1, 3, 4, and the
govt/investment-org group.

---

## GROUP 2: Dutch-Bangla Bank, BRAC Bank, Eastern Bank, Prime Bank, Dhaka Bank

### Dutch-Bangla Bank (DBBL)
Source: https://www.dutchbanglabank.com/depositsadv/term-deposit.html (official)
CAUTION: page cites a 2021 BRPD circular as basis — rate currency uncertain, verify before trusting.

FDR:
- 3 months: 7.00%
- 6 months: 7.10%
- 12-36 months: 7.20%
- 13 months (special): 8.50%

DPS (DBBL calls these DPS/CHESS/MDS):
- 3/5/8/10 years — DPS: 9.50%
- 3/5/8/10 years — CHESS (Children Education Savings): 9.70%
- 3-10 years — MDS (Millionaire Deposit Scheme): 9.50%
NOTE: conflicts with a separate "Future Line" DPS page that only shows payout tables, not %. Needs manual verification before publishing.

### BRAC Bank
Source (PDF): https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_w.e.f._August_25,_20266a8acd8867c0f.pdf
Linked from: https://bracbank.com/en/page/deposit-interest-rate
Effective: August 25, 2026

FDR (Retail Monthly Interest FD — FRABR, cleanest table):
- 6 months: 8.00%
- 12/14/18/24/36/60/84 months: 8.25%

FDR (Classic/General FD, tiered by amount — extraction ambiguity flagged, re-verify before publishing):
- 90-150 days (~3mo): 7.50% (1L-<1Cr) / 8.00% (1Cr-<5Cr) / 8.00% (>=5Cr)
- 180d-9mo (~6mo): 8.00% / 8.25% / 8.25%
- 12-36 months: 8.25% (all tiers)

DPS:
- FRFLX (Retail/SME Flexi DPS): Yr1 8.50%, Yr2 8.75%, Yr3-10 9.00%
- FRFLT (TARA/Premium/Probashi/Employee DPS): Yr1 8.75%, Yr2 9.00%, Yr3-10 9.25%

### Eastern Bank (EBL)
Source (PDF): https://www.ebl.com.bd/assets/home/interest/Deposit_Rate_sheet-ED_02_August_2026_EBL_WEB_Version.pdf
Linked from: https://www.ebl.com.bd/retail-deposit/EBL-FD
Effective: August 2, 2026

FDR (standard, Retail):
- 1 month: 2.00%
- 3 months: 6.35%
- 6 months: 6.50%
- 1 year: 6.50%
- 2 years: 7.25% (<1Cr) / 7.50% (1-5Cr) / 7.75% (5-25+Cr)
- 3 years: 7.25% (<1Cr) / 7.50% (1-5Cr) / 7.75% (5-25+Cr)

FDR ("Extra Value FD" — higher-rate variant):
- 6 months: 8.75%
- 1 year: 9.00%

DPS ("Recurring Deposit" schemes):
- EBL Confidence: 1yr 9.00%, 2yr 9.00%, 3yr 9.00%, 5yr 9.00%, 7yr 8.75%
- EBL Millionaire Scheme: 2yr 9.00%, 3yr 9.00%, 5yr 8.75%, 7yr 8.75%
- EBL Kotipoti: 5yr 9.00%
- Legacy/closed to new customers: EBL Secure DPS 9.50%, EBL Just Double 10.41%

### Prime Bank
Source (PDF): https://www.primebank.com.bd/assets/interest-rate/1784525614-Interest-Rate-Conventional-w-e-f-20-JUL-26.pdf
Linked from: https://www.primebank.com.bd/interest-or-profit-rates
Effective: July 20, 2026

FDR (Prime Fixed Deposit — Consumer):
- 3 months: 7.00%
- 4 months: 8.75%
- 6 months: 8.75%
- 7 months: 8.50% (<1Cr) / 9.00% (>=1Cr)
- 12 months: 9.00%
- 13-14 months: 7.00%
- 24-36 months: 8.00%

FDR ("Prime Fixed Deposit Plus"):
- 91 days: 8.50% (<1Cr) / 8.75% (1-5Cr) / 9.00% (>=5Cr)
- 181 days: 8.75% (<1Cr) / 9.00% (1-5Cr) / 9.10% (>=5Cr)

DPS:
- Prime Kotipoti DPS: 60-180 months (5-15yr): 9.00%
- Prime Millionaire Scheme: 60-84 months (5-7yr): 6.00%; 120-144 months (10-12yr): 7.00%

### Dhaka Bank
Source (PDF): https://dhakabank.com.bd/wp-content/uploads/2026/08/Deposit-Rate-Effective-from-Aug-06-2026.pdf
Linked from: https://dhakabankltd.com/rates-and-charges/
Effective: August 6, 2026

FDR (multiple parallel products, exact 3/6/12/24mo split for "Regular FD" NOT resolved — flagged, re-verify):
- Regular FD, 1 month: 4.00%
- Regular FD, 3-24 months: range 7.75-8.25% (imprecise, re-verify)
- FD Plus, 4 months: 7.75%
- FD Plus, 7 months: 8.00%
- FD Plus, 13 months: 8.25%
- Special FD (SME/Corp), 91 days: 9.00%
- Special FD (SME/Corp), 182-364 days: 8.75%
- Senior Citizen Special FD, 3-12mo: 8.75-9.00%
- Aroni FD (Retail), 3-12mo: 8.75-9.00%

DPS: NOT FOUND on official source (product pages describe the scheme but publish no percentage). A third-party aggregator claimed 9.50-10.00% but is explicitly excluded per our sourcing rule.

---

## GROUP 1: Sonali, Janata, Agrani, Rupali, Islami Bank Bangladesh

### Sonali Bank PLC
Source (PDF): https://www.sonalibank.com.bd/PDF_file/intt_rates.pdf — Circular No. 18, dated 15 June 2026
Effective: 16 June 2026

FDR:
- 3mo to <6mo: 8.00%
- 6mo to <1yr: 8.25%
- 1yr to max 3yr: 8.50%

DPS — Source: https://www.sonalibank.com.bd/schemes-new.php (no effective date stated)
- Sonali Deposit Scheme (SDS), 5yr: 6.50% (compounded)
- Education Deposit Scheme, 10yr: 6.50% (compounded)
- Medical Deposit Scheme, 10yr: 6.50% (compounded)
- Lakhpoti Deposit Scheme: 2yr 5.00% / 3yr 5.50% (compounded)
- Anannya Sonali Deposit Scheme: 3yr 9.00% / 5yr 9.25%

### Janata Bank PLC
Source (PDF): https://www.jb.com.bd/assets/file/documents/rate_of_interest_2026-04-30_05-06-50am.pdf — Circular 1397/26, dated 29 April 2026
Effective: 1 May 2026

FDR:
- 3mo to <6mo: 8.50%
- 6mo to <1yr: 8.75%
- 1yr to <=2yr: 9.00%

DPS — Source: https://www.jb.com.bd/products/scheme_deposit
- JBDPS, 5 & 10yr: 10.00% (compound) [Circular 1316/2025]
- JBKDS (Kotipoti), 4-15yr: 8.75% (compound) [Circular 1369/2025]
- JDS, 5yr: 6.00% (compound)
- NRPS, 5yr: 8.50% (simple)
- Women's Welfare Savings Scheme, 5 & 10yr: 7.50%

### Agrani Bank PLC
Source: https://www.agranibank.org/index.php/home/deposits_products/Fixed-Deposit-Account (no effective date stated)

FDR:
- 3 months: 8.50%
- 6 months: 8.75%
- 1 year+: 9.00%

DPS — Source: https://www.agranibank.org/index.php/home/deposits_products/Agrani-Bank-Lakhpoti-Deposit-scheme
- Lakhpoti: 3yr 5.00%, 5yr 5.50%
- NRB Deposit Scheme (non-resident specific): 3yr 7.00%, 5yr 7.50%
NOTE: Agrani has no clear general-public monthly-DPS with tiered rates beyond Lakhpoti.

### Rupali Bank PLC
Source (PDF): https://rupalibank.com.bd/download.php?file=20251019124828-48436.pdf — Circular 2025/06, dated 19 Oct 2025
Effective: 20 October 2025

FDR:
- 3 months: 8.25%
- 6 months: 8.50%
- 1 year+: 8.75%

DPS — official product pages, no effective date stated:
- RDPS "Shimul": 3yr 7.50%, 5yr 8.00%, 8yr 8.50%
- RMSS (Monthly Saving Scheme): 3yr 5.25%, 5yr 5.50%, 8yr 6.00% (compounded)

### Islami Bank Bangladesh PLC
Source (PDF): https://www.islamibankbd.com/public/assets/profit-rate-main/1775551629_Provisional%20Profit%20rates%20w.e.f.%2001.01.2026.pdf
Effective: 01.01.2026 (marked "unchanged" as of retrieval)

Mudaraba Term Deposit (MTDR) — profit rates (FDR equivalent):
- 1 month: 5.25%
- 3 months: 9.50%
- 6 months: 9.80%
- 100 days: 9.60%
- 200 days: 9.90%
- 300 days: 9.95%
- 12 months: 10.00%
- 24 months: 10.20%
- 36 months: 10.50%

Mudaraba Special Savings/Pension (RDS/MSS) — DPS equivalent:
- 6mo: 5.25%, 1yr: 5.75%, 2yr: 6.00%, 3yr: 6.75%, 4yr: 6.75%, 5yr: 7.25%, 7yr: 7.50%, 10yr: 7.75%, 15yr: 8.00%

CAUTION (from researching agent): state-bank circulars get replaced at new URLs every revision (no stable "current rate" API) — re-check periodically.

## GROUP 4: NCC Bank, Bank Asia, Trust Bank, Southeast Bank, IFIC Bank

### NCC Bank
Source (PDF): https://www.nccbank.com.bd/assets/files/rates_files/Deposit_Rates.pdf
Effective: July 15, 2025 (header date; footer references older Apr 07, 2025 ALCO decision)

FDR (base product, tiered by amount: <50L / 50L-<1Cr / 1Cr-<5Cr / >=5Cr):
- 3 months: 9.00% / 9.25% / 9.50% / 9.75%
- 6 months: 9.25% / 9.50% / 9.75% / 10.00%
- 1 year: 9.50% / 9.75% / 10.00% / 10.25%
- 2 years: 9.00% / 9.25% / 9.50% / 9.75%
- 3 years: 9.00% / 9.25% / 9.50% / 9.75%

DPS:
- Special Saving Scheme/Deposit Plus: 7.00% p.a. monthly compounding, 3/5/8/10yr. Source: https://www.nccbank.com.bd/assets/files/rates_files/SSS_Rates.pdf — dated 01 Nov 2020, POSSIBLY STALE (not reissued since), flag before publishing.
- Kotipoti/Millionaire Scheme: 10.00% flat, 2/3/4/5/10/15/20yr (same July 2025 sheet as FDR)

### Bank Asia
Source: https://www.bankasia-bd.com/other/interestrates
Effective: August 4, 2026

FDR (Individuals):
- 1 month: 4.00%
- 2 months: 5.00%
- 3 months: 8.00%
- 6 months: 8.50%
- 1 year: 8.25%
- 2 years: 8.25%
- 3 years: 8.25%
(Companies tier nearly identical, differs only at 1-2mo tenures)

DPS: NOT FOUND — "DPS Plus" product page only shows maturity-value table, no annual % rate published anywhere official. Correctly not back-calculated per sourcing rule.

### Trust Bank
Source: https://www.tblbd.com/rates-and-charges/deposit-rates
Effective: August 11, 2026

FDR (Individuals/EPF, tiered by amount: <50L / 50L-1Cr / 1Cr-5Cr / >=5Cr):
- 1 month: 3.00% / 3.25% / 3.50% / 3.75%
- 3 months: 7.75% / 8.00% / 8.25% / 8.50%
- 6 months: 7.75% / 8.00% / 8.25% / 8.50%
- 1 year: 7.75% / 8.00% / 8.25% / 8.50%
(No standard 2yr/3yr FDR; instead "Trust ECHO/ECHO Plus" 8.25% for 6/12/24/36mo, "Trust Seniors ECHO" 8.75%)

DPS:
- Trust Smart Savers: 9.50% flat, 3/5/7/10yr, installments Tk 500-100,000/mo

### Southeast Bank
Source (PDF): https://www.southeastbank.com.bd/documents/deposit_rates/All_Deposit_list_of_SEBPLC-June-07-2026.pdf
Effective: "Last Updated: June 07, 2026"

FDR (Retail, tiered: <10L / 10L-50L / 50L-1Cr / 1Cr-5Cr / >=5Cr):
- 3 months: 8.00% / 8.25% / 8.75% / 9.25% / 9.50%
- 6 months: 8.00% / 8.25% / 8.75% / 9.25% / 9.75%
- 1 year: 8.25% / 8.50% / 9.00% / 9.50% / 9.75%
- 2 years: 8.00% / 8.25% / 8.25% / 9.25% / 10.00%
- 3 years: 8.00% / 8.25% / 8.25% / 9.25% / 10.00%

DPS — "Shohoz DPS" (effective-rate table):
- 2yr: 9.9248%, 3yr: 9.3807%, 5yr: 9.1096%, 7yr: 8.8391%, 10yr: 8.5692%
(Also "Monthly Savings Scheme" Tk1000 installment: 2yr 9.00%, 3yr 8.90%, 5yr 8.76%)

### IFIC Bank
Source (PDF): https://ificbank.com.bd/public/assets/home/interest/1786857538_Latest%20Deposit%20Advance%20Rate__16.08.2026.pdf
Effective: 16.08.2026

FDR — Term Deposit (tiered: up to 1L / 1L-5L / 5L-20L / 20L-50L / 50L-1Cr / >1Cr):
- 3 months: 9.00% / 9.50% / 9.50% / 9.75% / 10.00% / 10.00%
- 6 months: 9.00% / 9.50% / 9.75% / 10.00% / 10.00% / 10.00%
- 1 year: 9.00% / 9.50% / 10.00% / 10.00% / 10.00% / 10.00%
- 2 years: 9.00% / 9.50% / 10.00% / 10.00% / 10.00% / 10.00%
- 3 years: 9.00% / 9.50% / 10.00% / 10.00% / 10.00% / 10.00%

DPS:
- IFIC Aamar Bhobishawt (main DPS): 10.00%, 1-10yr (source: same sheet + dedicated PDF w.e.f. 11.02.2024)
- Pension Savings Scheme (PSS) & PSS-Joma: 9.50%, 3 & 5yr (w.e.f. 15.06.2025)
- IFIC Nano DPS (weekly installment): 8.00% p.a., 1/2/3yr

## GOVT + INVESTMENT ORGS: Sanchayapatra, Pensioner/Poribar Sanchayapatra, T-Bond, T-Bill, IPDC, Shanta, LankaBangla, IDLC

Method note: some .gov.bd domains had broken SSL and were unreachable directly; those figures were cross-verified across >=2 independent news sources reporting the same official circular instead.

### Bangladesh Sanchayapatra (5-Year)
Sources (cross-corroborated): Dhaka Tribune (dhakatribune.com/business/400262), Prothom Alo (prothomalo.com/business/economics/iq43l4lkvg), khoborsangjog.com
Effective: July 1, 2025 - December 31, 2026 (reconfirmed unchanged for H2 2026)
- Up to Tk 7.5 lakh: 11.83%
- Above Tk 7.5 lakh: 11.80%

### Pensioner Sanchayapatra
Same sources, same effective window
- Up to Tk 7.5 lakh: 11.98%
- Above Tk 7.5 lakh: 11.80%

### Poribar Sanchayapatra
Same sources, same effective window
- Up to Tk 7.5 lakh: 11.93%
- Above Tk 7.5 lakh: 11.80%
NOTE: rates were briefly cut effective Jan 1 2026 per a Dec 28 2025 notice, then REVERSED Jan 4 2026 back to the July 2025 rates above; reconfirmed unchanged through H2 2026.

### Treasury Bond (BGTB)
Source: https://www.bb.org.bd/en/index.php/monetaryactivity/treasury (live cut-off yield table)
- 2yr (auction 09/08/2026): 9.3900%
- 5yr (auction 12/08/2026): 9.3496%
- 10yr (auction 19/08/2026): 9.2340%
- 15yr (auction 27/08/2026): 9.0975%
- 20yr (auction 27/08/2026): 9.1275%

### Treasury Bill
Source: same BB page, auction date 24/08/2026
- 91-day: 8.8290%
- 182-day: 8.9200%
- 364-day: 9.0700%

### IPDC Finance Limited
Source (PDF): https://ipdc.com/assets/ipdc/downloads/forms/retail-deposit-products-rates.pdf — "Effective from: August 18, 2026"
- FD General: Standard (3/6/12mo) 3.50%; Classic 3mo 6.00%, 6mo 6.15%, 12mo 6.25%; Extra Value 3mo 9.00%, 6mo 9.15%, 12/24/36/60mo 9.25%
- Deposit Premium/Millionaire/Double Money(7y6m)/Ultiflex: all 9.75% (min tenure >=3yr)
- Icche DPS (student 18-35, Tk1000 premium): Female 1yr 8.75% / 3yr 9.75% / 5yr 10.05%; Male 1yr 8.25% / 3yr 9.25% / 5yr 9.75%
- +0.30% bonus for certain categories/app customers on FDR tenures <=12mo

### Shanta Asset Management
Does NOT offer FDR/DPS deposit products — confirmed via shanta-aml.com. It's a mutual fund/asset manager (3 mutual funds + SIP), not deposit-taking. Not comparable/listable as FDR/DPS.

### LankaBangla Finance
Source: https://www.lankabangla.com/deposit-rates/
Effective date on page: April 27, 2025 (could not confirm more recent revision — re-check periodically)
- Earn First TDR: 3mo 9.00%, 6mo 9.50%, 1yr 9.75%, 2yr 9.50%, 3yr 9.50%
- Classic TDR: 100d/3mo 10.00%, 6mo 10.50%, 1yr 10.75%, 2-4yr 10.50%
- Money Builder DPS: ~10.75% across 2/3/4/5/10yr

### IDLC Finance — RESOLVED (2026-08-28, follow-up via r.jina.ai proxy)
Source: https://www.idlc.com/term-deposit (JS SPA, extracted via rendering proxy)
Effective: 16 August 2026

FDR (Regular Term Deposit):
- 3-5mo: 9.00% (entered at 3mo)
- 6-11mo: 9.25% (entered at 6mo)
- 12mo+: 9.00% (entered at 12/24/36mo)
(Also: 100/500-day variants, Monthly/Quarterly Earner, Double/Triple Money, Interest First — all secondary products, not entered)

DPS (Offline DPS, 2-25yr): 9.00% flat (entered at 24/36/60mo)
Note: +0.10% premium for female/senior-citizen account holders on several products — not modeled (schema has no such dimension).

## FOLLOW-UP RESEARCH (2026-08-28, same day, second pass)
User supplied City Bank's correct URL and asked for another push on the remaining gaps.

### Standard Chartered Bangladesh — CONFIRMED still no specific rate
Re-checked official matrix PDF + retail product page. SC Bangladesh genuinely does not publish a specific advertised FDR rate anywhere public — only the 0.05%-5.00% regulatory range. Still not entered as a rate tier (would misrepresent).

### Bank Asia DPS — CONFIRMED still NOT FOUND
DPS Plus page still shows only a maturity-value table, no percentage. Bank Asia's public "Interest Rates" page only serves a lending-rate PDF, not deposit rates. Still not entered.

### Pubali Bank — RESOLVED (2026-08-28, user supplied the PDF directly)
User saved the bank's own rate sheet to research/pubali_bank_rate.pdf and pointed me at it — read directly via the PDF tool (no proxy needed once we had the actual file).

FDR: 1mo 5.00%, 3mo/100-day 8.00%, 6mo 8.25%, 12mo+ 8.50%
DPS-equivalent: no generic "Deposit Pension Scheme" rate published (row literally says "----"). Several named pension/recurring schemes exist instead, all pegged to "1 Year FDR Rate" = 8.50% flat regardless of tenure:
- Pubali Pension Scheme (PPS): 3/5/7/10yr — used as the flagship DPS entry (36/60/84/120mo @ 8.50%)
- Pubali Sanchay Prokalpo (PSP): 5/10yr, same 8.50%
- Shikha Sanchay Prokalpo (SSP): 10yr, same 8.50%
Also present but not entered (niche/conditional products): Peoples Pubali Pension Scheme & Senior Citizen Pubali Deposit Scheme (6mo FDR +1%, compounded monthly, 9.25%), Digun Sanchoy Prokalpo (9yr, 8.055%), Monthly Profit Based FDR (min Tk 1 lac, 3/5yr, 1yr FDR +0.50% = 9.00%), Pubali Swadhin Sanchaya / Shawpna Puran (3mo FDR +1% = 9.00%).

### Bank Asia DPS — RESOLVED (2026-08-28, user supplied the brochure URL)
Source (PDF): https://www.bankasia-bd.com/downloads/Bank_Asia_DPS_Brochure.pdf
Effective: stated "will be effective from 01 February 2026" on the brochure.
DPS+ (ডিপিএস+, the flagship general scheme) — rate by tenure, confirmed identical across all deposit-amount rows (500 to 20,000 Tk/month):
- 3yr: 9.81%, 5yr: 9.96%, 7yr: 9.15%, 10yr: 9.27%, 12yr: 9.34%
Also present but not entered (niche/eligibility-restricted): "আঁচল" (Aanchal, women-only, higher rates 9.00-10.55%), "সঞ্চয়েই কোটিপতি" (goal-based lump-sum-target scheme), "ভ্রমণ" (travel fund, 1-3yr packages).

### Dhaka Bank DPS — RESOLVED (2026-08-28, back-solved from user-supplied maturity chart)
User provided a screenshot of Dhaka Bank's official "DPS Maturity Value Chart" (dated "Updated on March 27, 2024" per its own footnote — this is the only source, no percentage rate is published anywhere by the bank, only maturity BDT amounts by monthly-deposit x tenure).
Method: solved for the annual nominal rate R (monthly-compounded annuity, i=R/12) that makes our own calculateDPSMaturity formula exactly reproduce the chart's maturity value, via bisection. Cross-checked against 3 different monthly-deposit rows (500/1,000/25,000 Tk) per tenure — all three gave the identical rate to 6 decimal places, confirming no amount-based tiering and that the back-solve is sound, not coincidental.
Rates found (entered to 3dp, the schema's precision limit):
- 2yr: 9.443%, 3yr: 9.164%, 4yr: 9.027%, 5yr: 9.898%, 6yr: 9.367%, 7yr: 8.855%, 8yr: 8.591%, 10yr: 8.317%
Dhaka Bank's DPS `RateProduct.compounding` was set to MONTHLY (overriding the default QUARTERLY) to match this derivation — verified the app's own calculation code reproduces the chart to within a few BDT out of 100,000+ at every tenure (residual is purely the DB's 3-decimal rate-precision limit, not an error).

### Shanta Asset Management — analyzed, NOT entered as a rate
Source: https://www.shanta-aml.com/our-funds/shanta-fixed-income-fund (fetched 2026-08-28)
This is an open-end mutual fund (perpetual life, moderate risk), not a deposit-taking institution — it has no guaranteed rate at all, only historical/variable returns:
- Trailing returns (as of 29 Aug 2026): since inception (4yr 9mo) 41.97%, 1-year 15.69%, 6-month 5.42%, 3-month 2.93%, YTD 10.31%
- Annual dividend distribution history: 2021 0.0%, 2022 2.0%, 2023 4.0%, 2024 5.2%, 2025 8.0%
- NAV 12.277 BDT/unit, AUM 3,045.2M BDT, inception 16 Aug 2021, min SIP Tk 1,000/month
DECISION: none of this was entered into RateTier. This app's schema models a guaranteed interestRatePct that the calculator compounds forward as if certain — doing that with a NAV-based mutual fund's trailing historical return would imply a guarantee that does not exist and could mislead a user into thinking their money is assured to grow at, say, 15.69%. A real fund-tracking feature (variable NAV, non-guaranteed) is a different schema/UI shape than what Phase 1 supports — worth a Phase 2/3 addition, not a shortcut through the existing FDR/DPS fields.

### 3 Monthly Profit Bearing Sanchayapatra — RESOLVED (2026-08-28, added per user request)
Sources: https://www.dhakatribune.com/business/400262/govt-withdraws-new-savings-certificate-rates (cross-checked against unb.com.bd's coverage of the same Finance Division circular)
Tenure: 3 years (36 months), pays profit quarterly rather than at maturity (still modeled here as a single maturity-tenure rate tier, consistent with how the other Sanchayapatra products are modeled — the calculator computes maturity value, not the interim quarterly payout schedule).
Rate: up to Tk 7.5 lakh: 11.82%; above Tk 7.5 lakh: 11.77%. Same effective window as the other 3 Sanchayapatra products (Jul 2025 rates, reconfirmed unchanged through Dec 2026).

## CLEANUP (2026-08-28, per user request)
- Deleted "Demo Bank (Sample Data — Replace Me)" institution entirely (was always meant to be removed before real data existed; now that 20+ institutions have real rates, no demo is needed).
- Deleted "Standard Chartered Bangladesh" institution entirely — kept showing an empty "—" row on the site for no benefit, since no specific rate could ever be honestly published for it (regulatory range only).
- Both removed via the new scripts/remove-institution.ts utility (also removed from prisma/seed.ts so they aren't recreated on the next seed run).

## SECOND FOLLOW-UP (2026-08-28, third pass)

### Uttara Bank DPS — RESOLVED
The bank's rate-summary page (/home/interestrate) states a single flat rate,
"Monthly Deposit Scheme (MDS) ... 10.00%" (as-on 09-Aug-2026), with no tenure
breakdown. The bank's dedicated MDS product page
(https://www.uttarabank-bd.com/index.php/home/depositproduct/5, via r.jina.ai
proxy — direct fetch got a 403) states "Tenure: 05 years & 10 years" but embeds
the actual rate in an image chart rather than text. Combined the two: entered
at 60mo and 120mo, both 10.00% — this is combining two of the bank's own
official pages, not a guess, but flagged here since no single page states both
facts together.

### Shanta Asset Management — REMOVED (institution deleted)
Per user instruction ("remove those or apply other mechanisms if you think"),
decided to remove rather than force it into the fixed-rate schema. It's an
open-end mutual fund with variable, NAV-based returns (see the earlier analysis
above: 1yr trailing return 15.69%, but dividend history ranged 0%-8% by year) —
structurally not a deposit-taking institution and can never have a genuine
guaranteed FDR/DPS-style rate. Forcing its historical return into the
guaranteed-rate calculator would misrepresent it. Removed via
scripts/remove-institution.ts and from prisma/seed.ts's INVESTMENT_ORGS list.
A proper "Mutual Funds" feature (variable NAV tracking, no guaranteed-maturity
calculator) would be the right way to bring it back — noted as a Phase 2/3 idea.

### Full audit result
Queried every product in the database for zero rate tiers after the above two
fixes — result: zero gaps remaining. Every institution/product either has a
real sourced rate or does not exist in the database at all (no institution is
left showing a permanently empty row for no reason).

## THIRD FOLLOW-UP (2026-08-29): UCB, Jamuna Bank, and a full long-tenure re-audit

User added two banks with specific URLs, then asked for a broader check: many BD
banks run DPS schemes out to 15-20 years and FDR out to 10-15 years, and the
concern was that earlier research may have truncated to short/common tenures.

### United Commercial Bank (UCB) — NEW
FDR: https://www.ucb.com.bd/banking/retail-banking/ucb-earning-plus-fixed-deposit-uepfd/
UEPFD, quarterly-payout column, tenor explicitly "1 to 10 years": 1-3yr @10.00%,
4-10yr @8.25%. Entered at 12/24/36mo and 48/60/84/120mo.
DPS: https://www.ucb.com.bd/banking/retail-banking/ucb-superflex-dps/
Super Flex DPS publishes only ONE maturity-value example per tenure (not
multiple amounts like Dhaka Bank), so back-solved rate has lower confidence —
no cross-validation was possible. Tenures 1/2/3/5/10yr, back-solved rates
11.20/10.30/10.28/10.31/10.14%. Re-audit (2026-08-29) confirmed both tenure
lists are complete (nothing beyond 10yr for either product) and confirmed no
second data point exists anywhere on the site to improve DPS confidence.

### Jamuna Bank — NEW
DPS: user-supplied PDF, https://jamunabankbd.com/wp-content/uploads/2026/08/Rates-of-Deposit-Schemes_PP-1.pdf
This PDF is a large "Deposit Schemes" deck with ~15 named schemes (Education,
NRB Monthly Saving, Marriage up to 18yr, Rural up to 18yr, Millionaire,
Kotipati, Pension, Hajj, etc.) — only "Monthly Savings Scheme" was entered
(the generic/general one), cross-validated at 2 deposit amounts per tenure
(500 and 1000 Tk), confirmed a clean fit: 3yr 9.50%, 5/8/10yr 9.00% flat.
Re-audit (2026-08-29) confirmed this scheme tops out at 10 years, matching.
FDR: NOT entered. The bank's FDR/MTDR sheet (originally found: March 2025,
superseded during re-audit by a newer Aug 9 2026 doc) publishes only
tenure-tiered RANGES (e.g. 3mo: 7.25-9.75%), never a specific rate, and no
tenure beyond 12 months exists on either version — same reasoning as
Standard Chartered's exclusion.

### Full long-tenure re-audit (5 parallel research passes against the exact
same sources already on file, hunting specifically for tenures beyond what
was captured)

**Confirmed already complete, no changes** (the "common tenures" originally
captured turned out to be the bank's actual full range): Sonali Bank, Janata
Bank, Agrani Bank, Rupali Bank, Islami Bank Bangladesh, Dutch-Bangla Bank FDR,
Eastern Bank FDR, Prime Bank FDR, Bank Asia (both), IFIC DPS, IDLC FDR,
LankaBangla FDR (also corrected effective-date label: source now reads
"Effective From April 27, 2026", not April 2025), IPDC (both), UCB (both).

**Extended with newly-found longer tenures, same product, same source:**
- Dutch-Bangla Bank DPS: added 96mo (8yr) @ 9.50% — scheme runs 3/5/8/10yr
- BRAC Bank FDR (FRABR): added 60/84mo @ 8.25% — full list is 6/12/14/18/24/36/60/84mo
- BRAC Bank DPS (FRFLX): added 60/84/120mo @ 9.00% — confirmed open-ended to 10yr at the Year-3+ rate
- Eastern Bank DPS (EBL Confidence): added 48/72/96/108/120/144/168/180mo — full published table runs 1-15yr, 9.00% through yr6 then 8.75% yr7+
- Prime Bank DPS (Kotipoti): added 84/144/180mo — exact tenure set is 60/84/120/144/180mo only (36/48/240 explicitly "not offered")
- NCC Bank DPS (Kotipoti/Millionaire): added 36/48/180/240mo — full list is 2/3/4/5/10/15/20yr, flat 10.00%
- Southeast Bank FDR: added the 6-month tier (5 amount bands) — this data was already captured during original research but never entered into the import script, an oversight now fixed
- IFIC Bank FDR: added 1mo flat rate + full 6/24/36mo tiered tables — original entries only covered 3mo/12mo despite the source having a complete 1/3/6/12/24/36mo x 6-bracket table
- The City Bank: extended General DPS to 60/120mo (confirmed step at month 37: 8.50% through 36mo, 9.00% from 37mo to 120mo)
- Bangladesh Treasury Bond: added 3yr tenor @ 9.90% (current auction schedule includes 2/3/5/10/15/20yr, not just the 5 previously captured)
- IDLC Finance DPS: added 120/300mo — confirmed flat 9.00% across the entire published "2 to 25 years" range, no step-ups

**New product added:** The City Bank "Insurance-Backed DPS" — a distinct
long-tenure product (not a tenure extension of General DPS), individuals only,
flat 8.50% across 5/10/15/20yr. Added as its own RateProduct since mixing it
into General DPS's numbers would have misrepresented two different products
as one continuum.

**Dhaka Bank FDR — switched products.** Was using "Special FD (SME & Corp)"
(capped at 12mo). Re-audit found "Regular Fixed Deposit" is the more
representative general-public product and extends to 24 months: 1/3/6/12/18/24mo
@ 4.00/7.75/8.00/8.25/8.25/8.25%. Confirmed via re-audit that NO Dhaka Bank FDR
product (Regular/Plus/Senior Citizen/Aroni/Obiram/Corporate Supreme) exceeds 24
months — that is the genuine ceiling, not a truncation.

**Deliberately NOT added** (imprecise, ambiguous, or unverifiable data —
consistent with the "only enter what's verifiable" rule):
- Mutual Trust Bank's additional 1/2/6/9-month and day-based FDR tenures — agent
  could only get an approximate range ("~3.5-8.5%"), not exact per-bracket figures
- NCC Bank FDR 24/36-month tiers — agent confirmed they exist but could only give
  an approximate range, not exact per-bracket numbers matching the existing 4-tier structure
- Uttara Bank's FDR Platinum tiers (Tk 2-25+ Crore brackets) — real, but scoped to
  ultra-high-net-worth deposits far beyond this app's typical user; skipped as niche,
  consistent with skipping other banks' senior-citizen/women-only/pension variants
- Uttara Bank's day-based FDR variants (100/200/300-day) — rates given only as an
  unresolved range, not exact per-tier numbers
- Uttara Bank's "Uttaran Kotipoti Deposit Scheme" — the only rate table is embedded
  as an image (Kotipoti DS(2).png), not machine-readable; would need a human to
  view it directly
- Trust Bank's "Trust ECHO" family (a longer-tenure flat-rate alternative to the
  base tiered FDR) — not added as a separate product to avoid clutter; noted for
  a future admin-panel addition if wanted
- The City Bank's day-count FDR variants (91-95 day, 335-380 day, etc.) — the
  re-audit agent flagged its own extraction as noisy/possibly-scrambled across
  individual/non-individual/NRB variants; needs a cleaner re-read before trusting
- The City Bank's "Monthly Interest Paying FD Account" (6mo-5yr) — a distinct
  product not yet captured, flagged for a future addition
- Jamuna Bank's FDR — still only published as ranges (see above), not entered
- Many differently-named long-tenure schemes surfaced during re-audit (Sonali's
  Millionaire Scheme 4-20yr, Janata's Kotipati/Millionaire/Hajj schemes up to
  20yr, Rupali's Kotipoti/Lakhpoti/Millionaire family, Islami Bank's Hajj/
  Education/Housing/Umrah schemes up to 25yr, Prime Bank's Edu DPS/Deposit
  Premium/Business DPS, Agrani's Pension/Double Benefit/Probash schemes) — these
  are all real products at real banks but were NOT added, to avoid diluting the
  cross-bank comparison with dozens of narrowly-eligible variants. A "browse all
  named products per institution" admin feature would be the right way to
  surface these later, rather than picking one arbitrarily as if it were "the"
  bank's rate.

Net result: 299 rate tiers across 54 products, 25 institutions.

## FOURTH FOLLOW-UP (2026-08-29): Jamuna Bank FD Freedom

User supplied a second image containing a specific-rate FDR product, "FD
Freedom" — resolves the earlier Jamuna Bank FDR gap (the base "FDR/MTDR"
product was range-only, so nothing was entered for it). FD Freedom is tiered
by amount (up to 1 Crore / above 1 Crore) across day-count tenures, mapped to
the nearest month:
- 91 days (~3mo): 9.80% / 9.90%
- 120 days (~4mo): 9.70% / 9.80%
- 182 days (~6mo): 9.40% / 9.60%
- 270 days (~9mo): 9.35% / 9.50%
- 364 days (~12mo): 9.30% / 9.40%
Entered as Jamuna Bank's FDR product (source: user-supplied image, no URL).
Net result: 309 rate tiers across 55 products, 25 institutions.

---

## GROUP 3: The City Bank, Mutual Trust Bank, Standard Chartered BD, Pubali Bank, Uttara Bank

### Mutual Trust Bank (MTB)
Source: https://www.mutualtrustbank.com/interest-rates/
Effective: FDR from Sept 2, 2024; DPS "Brick by Brick" from Nov 6, 2024; Angona DPS from Mar 25, 2025
CAUTION: these effective dates are notably older than other banks' Aug 2026 sheets — re-verify currency before publishing.

FDR (Retail general, tiered: <50L / 50L-<1Cr / 1Cr+):
- 3 months: 7.75% / 8.00% / 8.25%
- 6 months: 8.00% / 8.25% / 8.50%
- 9 months: 8.00% / 8.25% / 8.50%
- 1 year: 8.00% / 8.25% / 8.50%
- 2 years: 8.00% / 8.25% / 8.50%
- 3 years: 8.00% / 8.25% / 8.50%

DPS ("MTB Brick by Brick"):
- 1yr: 10.00%, 2yr: 10.00%, 3yr: 10.00%, 5yr: 10.00%, 8yr: 9.50%, 10yr: 9.50%

### Standard Chartered Bangladesh
Source (PDF): https://av.sc.com/bd/content/docs/bd-interest-rate-matrix.pdf
Effective: 01.08.2026
CAVEAT: this is a regulatory min-max RANGE disclosure, not a single advertised rate — actual offered rate depends on negotiation/relationship/amount. Not entering into the DB as a single number given this ambiguity (see compilation notes).

FDR/Time Deposit (range, all tiers):
- <3mo: 0.05%-1.00%
- 3mo-<6mo: 0.05%-5.00%
- 6mo-<1yr: 0.05%-4.75%
- 1yr-<2yr: 0.05%-5.00%
- 2yr-<3yr: 0.05%-4.00%
- 3yr+: 0.05%-4.00%

DPS: NOT FOUND on official rate sheet (no DPS line item).

### Uttara Bank PLC
Source: https://www.uttarabank-bd.com/home/interestrate
Effective: 09-Aug-2026

FDR (Standard, Individual, general tier):
- 3mo-<6mo: 8.50%
- 6mo-<1yr: 8.75%
- 1yr-5yr: 9.00%
FDR Platinum tiers (Tk 2-5Cr / 5-25Cr / 25Cr+) run 8.70-9.00% depending on tenure/tier.
Also: 100/200/300-day FDR variants 8.60-9.00% tiered by amount; 30-day FDR 5.50-7.50%.

DPS:
- Monthly Deposit Scheme (MDS): 10.00%
- Mashik Munafa Prokalpa (monthly income): 9.00%
- Double Benefit Deposit Scheme (8yr maturity): 9.00%
- Various named schemes (Millionaire/Lakhpoti/Kotipoti/etc.): 10.00-10.25%

### The City Bank — RESOLVED (2026-08-28, follow-up)
User supplied the correct rates URL: https://www.citybankplc.com/gsi/conventional-banking-products
Confirmed JS-rendered SPA as before, but successfully extracted via https://r.jina.ai/ rendering proxy.
No effective date stated on the page itself (caveat).

FDR (Individuals):
- 90 days (~3mo), <50L: 8.00%
- 90 days (~3mo), 50L-<1Cr: 8.00%
- 90 days (~3mo), 1Cr-<5Cr: 8.25%
- 365 days (~12mo), <1Cr: 8.25%
- 1yr/2yr/3yr, <1Cr: 8.25% (flat)

DPS (General DPS):
- 6-12 months: 8.50%
- 37-48 months: 9.00% (entered at 48mo, the stated upper bound, to stay within the verified range)
Also: Insurance-Backed DPS 8.50% flat, 5-20yr (not entered — secondary/niche product)

### Pubali Bank — NOT FOUND
Official site blocked by Cloudflare bot-challenge (403) on all attempts including PDF direct link, legacy site, Google Docs viewer, and Scribd mirrors. A search snippet suggested a PDF dated 07-05-2026 with 3mo ~8.50%, 6mo ~8.75%, 1yr ~8.50% but this was NEVER independently opened/confirmed — explicitly NOT to be published as verified data.

---

## RESEARCH COMPLETE — all 5 groups in as of 2026-08-28.
Two banks (The City Bank, Pubali Bank) have no verifiable current rate — leave with no rate tiers on the site (already the default empty state) until manually confirmed by opening their sites in a real browser or calling the bank.
Two products (Bank Asia DPS, IDLC FDR/DPS) have no findable official percentage — same treatment.
Standard Chartered FDR is a min-max regulatory range, not a single advertised rate — not entering as a rate tier; would need branch/relationship-manager contact for an actual offered number.

## UCB rate refresh (2026-08-29)

User supplied UCB's official Treasury rate circular #1632 (deposit rate sheet,
effective Aug 24, 2026): https://www.ucb.com.bd/reports/interest-rates/instruction-circular-no1632full-deposit-productsucb-websi.pdf

**FDR — "Retail UCB Earning Plus 1-10 Years" (Regular customer group, Quarterly
payout, prefix 3428), unchanged product mapping from before, but the rate moved:**
- 1-3yr: 10.00% → **9.50%**
- 4-10yr: 8.25% (unchanged)

**DPS — replaced the back-solved Super Flex estimate with the circular's
directly-published, per-tenure rates.** The previous entry was back-solved from
a single maturity-value example per tenure (explicitly flagged "lower
confidence" in the source comment) because the product page only gave one
worked example, not a rate table. This circular publishes the real rate table
directly:
- "UCB Super Flex Regular Deposit Scheme" (Regular customer group, prefixes
  3550/3580/3581/3582): 1yr 9.50%, 2yr 9.50%, 3yr 9.75%, 5yr 10.00%, 10yr 10.00%
- Previous back-solved figures (11.20% / 10.30% / 10.28% / 10.31% / 10.14% at
  the same five tenures) are now superseded — the gap at 1yr (11.20% estimated
  vs 9.50% actual) shows the back-solve had drifted meaningfully from the real
  rate, not just rounding noise.

**Product-identity check, since the circular lists several differently-named
recurring-deposit schemes at very different rates** (Prottoyi Monthly Deposit
6.00-7.00%, NRB DPS Plus / AYMA DPS Plus / Youngsters' DPS 9.50-10.00%,
Multi-Millionaire 10.00% flat, Super Flex 9.50-10.00%): confirmed via UCB's own
product page (https://www.ucb.com.bd/banking/retail-banking/ucb-superflex-dps)
that Super Flex DPS is a recurring monthly-installment scheme, open to general
retail customers (no gender/age/residency restriction), tenures exactly
1/2/3/5/10yr — matching the product we'd already been tracking and the exact
tenure set already in the schema. Prottoyi turned out to be an SME-banking
product (not general retail) via a separate site search, so it was correctly
never a candidate. The circular's own "Discontinued Products" list explicitly
names "Retail UCB DPS Plus" as discontinued — confirms Super Flex (not DPS
Plus) is the current product, not a naming mix-up.

Applied to both the local dev DB and production (Supabase) via `npm run
import-rates`.
Several sources carry caution flags (DBBL 2021 circular basis, MTB Sept 2024 effective dates, NCC SSS Nov 2020, LankaBangla Apr 2025, BRAC/Dhaka Bank table extraction ambiguity) — noted inline above; entering these as MANUAL source with the sourceUrl preserved so anyone can re-verify.

## BRAC Bank & City Bank cross-check (2026-08-29)

User supplied two sources to re-verify against:
- BRAC Bank's ALCO Circular 2026/07 (effective Aug 25, 2026): https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_w.e.f._August_25,_20266a8acd8867c0f.pdf
- City Bank's live rate page: https://www.citybankplc.com/gsi/conventional-banking-products

**BRAC Bank — every tracked rate confirmed unchanged.** FDR (Monthly Interest
FD, FRABR): 6mo 8.00%, 12-84mo 8.25% — identical to what was already entered.
DPS (FRFLX, by completed year): Yr1 8.50%, Yr2 8.75%, Yr3-10 9.00% — also
identical. Only the source URL was updated, from the general rate page to this
specific dated circular, for a more precise audit trail.

**City Bank DPS — updated.** The page's "Scheme Deposit" section cleanly lists
exactly two named DPS products: "Insurance Backed DPS Account" (confirmed
unchanged, flat 8.50% across 5/10/15/20yr) and "Goal Based DPS" — the latter's
month-37 step (6-36mo one rate, 37mo+ a higher rate) lines up exactly with the
step already tracked here under the generic "Deposit Pension Scheme" product,
confirming it's the same product, just re-rated: 6-36mo 8.50% → **9.00%**,
37-120mo 9.00% → **9.50%**, a uniform +0.50 pt increase across every bracket.

**City Bank FDR — deliberately left unchanged**, despite the page containing
an extensive "Fixed Deposit" section. That section lists dozens of near-daily
tenures (separate rows for "90 Days", "91 Days", "92 Days", "93 Days"... plus
"3 (Three) Months" as yet another separate row) with no product-name labels
distinguishing them, and the rates are internally inconsistent for what should
be the same ~3-month period — e.g. "3 Months" shows 6.15% while "92 Days"
(two days off from "3 months") shows 8.00%. This reads like a live treasury
booking export (each day-count likely a distinct booked-that-day product with
its own idiosyncratic rate) rather than a stable, customer-facing rate card.
Given the "only enter clearly verifiable data" rule, no single row here is
trustworthy enough to stand in as "the" representative retail FDR rate, so
the existing entries (last confirmed 2026-08-28) stand as-is.

Applied to both the local dev DB and production (Supabase) via `npm run
import-rates`.

## Islamic banking (Mudaraba) products (2026-08-31 / 2026-09-01)

Added Islamic banking as a full parallel category — a new `isIslamic` boolean on
`RateProduct`, a "Conventional / Islamic" filter on Calculator, Compare, and
Insights, and real Mudaraba FDR/DPS-equivalent products for every bank confirmed
to run one.

**Which banks actually run Islamic banking** — sourced from Bangladesh Bank's own
*Quarterly Report on Islamic Banking* (Dec 2024 data table), cross-checked against
each bank's own site/press coverage. Of the 21 tracked banks: Islami Bank
Bangladesh is a full-fledged Islamic bank; 16 more (Sonali, Agrani, Rupali,
Eastern, Prime, Dhaka, The City Bank, Mutual Trust, Pubali, NCC, Bank Asia,
Trust, Southeast, IFIC, United Commercial, Jamuna) run an Islamic window/branch
alongside conventional business; Dutch-Bangla Bank, BRAC Bank, and Uttara Bank
confirmed to have none; Janata Bank has regulatory approval but had not launched
as of the most recent official data.

**Rate sourcing** — dispatched as three parallel research passes (one per ~6
banks), each required to report real published rates with a source URL, or
explicitly say "not published" rather than estimate. Real, sourced rates were
found and entered for 9 of the 17 Islamic-banking institutions:

- **Islami Bank Bangladesh** — full Mudaraba Term Deposit Receipt (MTDR) and
  "Mudaraba Special Savings (Pension) including RDS MSS" tables, w.e.f
  01.01.2026, from the bank's own PDF.
- **Agrani Bank** — Mudaraba FDR (1/3/6/12mo) and Mudaraba Special Savings
  Scheme (5/10yr boundaries) from the bank's Islamic banking page, effective
  10-02-2026.
- **Dhaka Bank** — Mudaraba Special Deposit Scheme (MSDS, FDR-equivalent) full
  table, effective March 03, 2026. Its two DPS-style products (Tayyebah
  Kotipoti, Mudaraba Deposit Pension Scheme) publish only an 8.50%-10.00% range
  with no per-tenure breakdown — skipped rather than guessing where in that
  range each tenure falls.
- **Prime Bank** — only "Prime Hasanah Edu DPS" has a published number (flat
  9.25% across 5/10/15/20yr). "Prime Hasanah Term Deposit" (the real
  FDR-equivalent) publishes no percentage on its page ("attractive provisional
  profit rate" only) — left as an FDR shell.
- **The City Bank** — City Islamic does not publish an advertised forward
  rate ("cannot provide certain profit rate to the depositors in advance").
  Used the bank's own historical *actual profit distributed* figures instead
  (Investment Income Sharing Ratio report, effective 21-Apr-2026, period June
  2026) — a genuinely different kind of number than other banks' advertised
  rate cards, flagged as such in the import script's comments.
- **Mutual Trust Bank** — full MTB Yaqeen FDR and DPS (Brick by Brick/Flexible/
  Angona Scheme) tables from the bank's own PDF, effective Nov 7, 2024 (FDR)
  and May 24, 2026 (Monthly Benefit Plan).
- **Bank Asia** — full Mudaraba Term Deposit Account (MTDA) table and Mudaraba
  Deposit Pension Scheme (MDPS, single flat rate across its 3-12yr band),
  effective August 09, 2026.
- **Trust Bank** — full Mudaraba Term Deposit (MTDR) table and Mudaraba Monthly
  Savings Scheme (MMSS, single flat rate across its tenure options), effective
  August 10, 2026.
- **IFIC Bank** — Mudaraba Term Deposit full table, from the bank's own PDF
  dated 16.08.2026 (saved locally as `research/ific_islamic_rates_16_08_2026.pdf`).
  No DPS entry: the PDF's other candidate recurring-deposit products ("Mudaraba
  Hajj DPS" is Hajj-purpose-restricted; "Mudaraba Aamar Bhobishawt" has no
  published tenure breakdown and its product type couldn't be confirmed even
  from this newer, authoritative source) — left as a DPS shell.

**Confirmed genuinely not published** (left as empty product shells, not
fabricated): Southeast Bank (MTDR/MMSS product pages exist but publish no rate
table at all; the bank's full deposit-rate PDF only shows a differently-named
dual-branded "Esteem Mudaraba" scheme, not the standard MTDR/MMSS products, so
not used), United Commercial Bank (UCB's own site explicitly states "UCB TAQWA
does not offer any provisional rate for any types of Mudaraba Accounts" —
confirmed no-rate, not a research gap), Jamuna Bank (Islamic banking page lists
product names only, no rate figures found anywhere; a general/conventional
deposit-schemes PDF exists but is not specific to the Islamic banking branches
and its numbers were deliberately not substituted in), NCC Bank and Pubali Bank
(Islamic banking pages either have no live rate table or are blocked from
automated access — Pubali's site is behind a Cloudflare bot-challenge; NCC's
Islamic banking menu links are dead placeholders). Sonali Bank, Rupali Bank, and
Eastern Bank (EBL) need a human to open their Islamic banking pages in a real
browser — automated fetching was consistently blocked (unrenderable page, 403,
or a profit-sharing ratio published with no percentage rate) despite repeated
retry attempts; these three remain product shells until someone can verify by
hand.

**Production import required a manual data-integrity check.** The first
production import run of this batch (~630 total entries across the whole rate
file) hit the same connection-drop issue (`P1017`, "Server has closed the
connection") documented in the Digital Bank rollout, twice in a row, each time
leaving a handful of products with deleted-but-not-recreated tiers. Rather than
re-running the full fragile script a third time, wrote a small targeted restore
script for just the 3 affected products, verified every value against the
source data by hand, then confirmed via a full re-run of the entire import
script (which completed cleanly on the next attempt) that every product in the
database — Islamic and conventional — matches the source file exactly, with
zero products left unexpectedly empty.

Applied to both the local dev DB and production (Supabase) via `npm run
db:seed` (new Islamic product shells) and `npm run import-rates` (real rates).

## Sonali Bank & UCB profit-sharing ratios (2026-09-01)

Followed up on the two Islamic-banking product shells left for Sonali Bank and
UCB above, per direct source links supplied by the user.

**Sonali Bank** — `https://www.sonalibank.com.bd/islami_banking.php` renders
blank because its embedded PDF viewer fails (`net::ERR_ABORTED` on
`https://www.sonalibank.com.bd/PDF_file/islami_banking/islami_banking_overview.pdf`,
confirmed via Playwright network-request monitoring). Curling that PDF URL
directly worked (genuine `application/pdf`, 2.3MB, 2 pages) and reading it
surfaced real data: the bank's মুদারাবা মেয়াদী জমা হিসাব (Mudaraba Term
Deposit) publishes a customer:bank profit-**sharing ratio**, not a percentage
rate — 50:50 up to 3mo, 60:40 up to 6mo, 65:35 up to 12mo, 68:32 up to 24mo,
70:30 up to 36mo. No DPS-equivalent ratio table was found in the PDF, so the
Islamic DPS product stays an empty shell. Saved as
`research/sonali_islamic_banking_overview.pdf`.

**UCB** — re-checked `https://www.ucb.com.bd/ucb-islamic/income-sharing-ratio-and-deposit/`
directly. Confirms the earlier finding: the page explains only the ISR
*methodology* ("Profit Rate will be determined every month according to the
Income Sharing Ratio (ISR) between Bank and Customer and Income from
investment"), with no actual ISR percentage or tenure-mapped figure published
anywhere on it. UCB's Mudaraba FDR/DPS stay empty shells — there is nothing,
rate or ratio, to enter honestly.

**Schema/product decision**: since a profit-sharing ratio can't be compounded
into a maturity amount the way a percentage rate can, it was modeled as a new
`ProfitSharingRatio` table (see `prisma/schema.prisma`), never as a
`RateTier.interestRatePct`. Displayed as info text on the homepage ("Ratio
70:30 at 3yr") instead of the percentage badge, and deliberately excluded from
Calculator/GoalCalculator/Insights — a product with ratio rows and zero
`RateTier` rows already renders as "not offered" everywhere except the
homepage list, by construction, with no new filtering logic required.

Real data entered via `scripts/import-real-rates.ts`'s new `ratioEntries`
array (5 rows for Sonali's MTDR) and applied to both local and production
(Supabase) databases; production values spot-checked post-import against the
source PDF and matched exactly.

## Full Islamic banking re-check, all 17 banks (2026-09-01)

Re-verified every Islamic FDR/DPS product in the system (10 with existing
real rates, 1 with ratio data, 6 empty shells at the time) directly against
each bank's live source, using parallel research passes followed by direct
curl/PDF verification of every finding before writing anything (never
trusting agent summaries alone for numbers going into the database).

**Confirmed unchanged, no action:** Agrani Bank (FDR+DPS), Bank Asia (FDR;
DPS numerically unchanged — see naming note below), Dhaka Bank FDR, IFIC
Bank, Islami Bank Bangladesh (both products — confirmed still the latest
dated PDF via the bank's own rate-history page), Mutual Trust Bank (both
products — branding on the bank's site has quietly moved from "MTB Yaqeen"
to "MTB Islamic Term Deposit" / "Brick by Brick / Flexible / Angona Scheme,"
numbers unchanged), Trust Bank FDR, Southeast Bank (still no MTDR/MMSS rate
table anywhere, only the unrelated dual-branded "Esteem Mudaraba" 9.00%
scheme), Jamuna Bank, NCC Bank, Pubali Bank (still Cloudflare-blocked),
Rupali Bank (page now loads but genuinely has no rate table), Eastern Bank
(EBL, still only the bank-wide 35:65 PSR with no tenure breakdown).

**Real changes applied:**
- **Trust Bank DPS (Mudaraba Monthly Savings Scheme)**: rate dropped from
  8.00% to a flat **6.00% p.a.** across all tenures — confirmed verbatim on
  the live page ("Present Provisional Profit rate for MMSS is 6.00% p.a.").
- **United Commercial Bank (UCB Taqwa)**: no longer a shell. UCB's
  `income-sharing-ratio-and-deposit` page still explains only the ISR
  methodology, but a separate, actively-updated monthly PDF
  (`ucb-islamic-rate-sheet-july-2026.pdf`, found via UCB's general rates
  listing page) publishes both the ISR% and a computed Profit Rate% — a real
  percentage, verified directly by downloading and reading the PDF (2 pages,
  genuine `application/pdf`). Entered FDR (1/3/6/12/24/36mo, 3.79–8.06%) and
  DPS (3/5/7/10yr, 7.59–8.06%) from the July-2026 "General Product (Retail)"
  column. Filename is dated and rolls monthly — if it 404s on a future
  check, re-resolve via `https://www.ucb.com.bd/rates/interest-rates/`
  rather than concluding no data exists again.
- **Prime Bank Islamic FDR**: no longer a shell. The old "Mudaraba Term
  Deposit" is now listed as discontinued (fresh booking disallowed) in the
  bank's Aug-31-2026 provisional-rate PDF, but the exact same rate table
  carried over verbatim to its live replacement, "Prime Hasanah Term
  Deposit" — a rebrand, not a rate change. Entered 1/3/4/6/7/12/13/14/24/36mo
  (2.00–7.00%, "Any Amount" tier) from the same PDF. DPS
  (Prime Hasanah Edu DPS, 9.25% flat) reconfirmed unchanged.
- **City Bank Islamic DPS — product-mapping fix**: the previously-stored
  7.73%/6mo was pulled from "Islamic Monthly Benefit Scheme," a lump-sum,
  monthly-payout product — not a recurring deposit. Re-extracted the live
  page's full table directly (not via summarization) and found the actual
  DPS analog, "Islamic Monthly Deposit Scheme," publishes a flat **7.64%**
  across all its stated tenures (1–10 years). Also expanded City Bank's FDR
  ("Islamic Term Deposit Receipt") from a single 12mo snapshot to its full
  published tenure ladder (1/3/6/12/15/24/36mo, 1.53–6.96%, "Individual,
  Upto 1 crore" tier — the bank publishes several amount tiers per tenure;
  this tier was chosen for consistency with how other banks' base tier was
  captured).

**Noted but not changed:** Agrani's stored DPS tenure/rate pairing
(60mo=7.5%, 120mo=8%) matches the bank's "Mudaraba Special Savings
Scheme-MSS (Monthly Deposit)" product, not "Mudaraba Monthly Profit Deposit
Scheme" as the generic label might suggest — confirmed correct, no rate
change needed. Bank Asia's DPS (Mudaraba Deposit Pension Scheme) is
genuinely a flat 6.45% across its whole 3–12yr range, not two independently-
published tenure points — the stored 36mo/144mo values are numerically
correct but the two-row shape slightly overstates precision the source
doesn't have; left as-is since it doesn't misrepresent the actual number.

Applied to local dev DB and verified end-to-end (typecheck, lint, test
suite, production build, Playwright homepage check confirming each updated
bank's card shows the new values) before promotion to production
(Supabase).

## Dhaka Bank / EBL / Jamuna / IFIC follow-up, plus Bangladesh Bank as a source (2026-09-01)

User supplied four specific URLs to re-check, one of them a Bangladesh Bank
regulator page not previously used as a source.

- **Dhaka Bank Mudaraba DPS** (`https://dhakabank.com.bd/mudaraba-deposit-pension-scheme/`):
  still only an 8.50%-10.00% range, no per-tenure table. The page does show a
  maturity-value grid (2/3/4/5/6/7/8/10-year tenures, updated Mar 27, 2024).
  Attempted the same back-solve-from-maturity-grid technique already trusted
  elsewhere in this codebase (implied monthly-compounded annuity rate from
  FV = P·[((1+r)^n−1)/r]). Unlike the earlier successful back-solve, the
  implied rates here are non-monotonic and noisy (9.44%, 9.16%, 9.03%, 9.90%,
  9.37%, 8.86%, 8.59%, 8.32% across 2/3/4/5/6/7/8/10yr) — they don't trend
  smoothly with tenure, meaning the grid isn't a simple flat-rate-per-tenure
  annuity. Forcing a computed number in would fabricate precision the source
  doesn't support, so left as a shell.
- **EBL** (`https://ebl.com.bd/islamic/profit-distribution`): previously
  403-blocked, now live and publishing a full "Weightage and Provisional
  Rate of Return" table (genuine percentages, effective May 03, 2026) —
  supersedes the earlier 35:65-ratio-only finding entirely. Retail FDR:
  1/3/6/12/24/36mo = 3.00/8.00/8.25/8.50/8.00/8.00%. DPS: found "EBL Islamic
  DPS Account - Confidence" (a genuine recurring deposit, distinct from the
  lump-sum "Mudarabah Monthly Profit Scheme" — same distinction as the City
  Bank DPS fix) at 1/3/5yr=10.00%, 8/10/12/15yr=9.50%.
- **Jamuna Bank** (`https://jamunabankbd.com/islamic/#Products` and
  `/interest-rates/`): still only lists product names, zero rate figures
  anywhere on the bank's own site (third confirmation). Bangladesh Bank's
  official regulator page (see below) filled this gap instead.
- **IFIC Mudaraba/Hajj DPS**: re-read the same PDF used for IFIC's FDR
  entries. "Mudaraba Hajj DPS" publishes a genuine flat 9.00% p.a. — the
  only recurring-deposit-shaped Islamic product IFIC gives a number for
  ("Mudaraba Mashik Munafa Scheme" is a lump-sum monthly-payout product,
  not a recurring deposit). Entered as the DPS shell's rate, noting it's
  purpose-labeled for Hajj.
- **Bangladesh Bank** (`https://www.bb.org.bd/en/index.php/financialactivity/intdepo_bankislamic`):
  a genuinely new, authoritative source — the regulator's own "Interest
  Rate of Scheduled Banks - Islamic Banking Window" table, aggregating
  every bank's Savings/SND/Fixed-Deposit rates monthly. Unlike every other
  source used in this project, most of its figures are RANGES per tenure
  band (e.g. Jamuna's FDR 3-6mo band: "7.25-9.90%"), not single advertised
  rates — likely aggregating across products/amount-tiers per bank. Used
  the upper bound as the "best/up to" rate (consistent with how this app
  already frames every other rate), entered only for Jamuna (the one bank
  in this batch with zero data on its own site): 3mo=9.90%, 6mo=9.60%,
  12mo=9.40% (2-3yr and 3yr+ bands are blank in BB's table for Jamuna, so
  no entry for those tenures). This source is available for every other
  Islamic-window bank in the system too and could be used to cross-check
  or fill further gaps in a future pass — worth remembering as a fallback
  when a bank's own site has nothing.

Applied to local dev DB, verified (typecheck, lint, test suite, production
build all passed; Playwright homepage check confirmed EBL/Jamuna/IFIC cards
show the new values with zero console errors) before promotion to
production.

## Routine drift check: MTB Islamic rate sheet rolled over (2026-09-05)

Proactive spot-check of the dated/monthly-rolling sources flagged in this
project's own comments (UCB's Islamic PDF, MTB's Islamic PDF, Prime Bank's
rate sheet) to see if any had gone stale since the last check (2026-09-01/02).

**UCB**: re-confirmed still on the July-2026 sheet — verified directly via
the bank's own rates listing page (`https://www.ucb.com.bd/rates/interest-rates/`)
and by re-downloading the PDF (identical byte size, 1,010,490 bytes, to the
copy fetched 2026-09-01). No change.

**Prime Bank**: still on the Aug-31-2026 sheet (only 5 days old at check
time), confirmed live. No change.

**MTB (Mutual Trust Bank) Islamic**: genuinely superseded. The bank's
`mtb-yaqeen` page now links a September PDF
(`Profit-on-Deposit-Latest-Sep-26v2.pdf`) instead of the July one this app
had stored — confirmed via direct PDF download and read (6 pages, effective
dates Sep 2-3, 2026 for the term-deposit/savings-scheme tables). Real
drift found and applied:
- **FDR** ("MTB Islamic Term Deposit (Individual) / MTB Islamic Angona Term
  Deposit", <50 Lac tier): 1mo rose 3.50%→4.50%; 3/6/12/24/36mo unchanged
  at 7.75%/8.00%/8.00%/8.00%/8.00%.
- **DPS** ("MTB Islamic Brick by Brick Scheme / Flexible Scheme,
  Individual"): dropped materially across every tenure — 12mo 10%→8.5%,
  24/36mo 10%→8.25%, 60/96/120/144/180mo 10%/9.5%/9.5%/9%/8.75%→flat 8.00%
  at all of 60-180mo.

Also re-checked MTB's *conventional* (non-Islamic) FDR/DPS rates while
already on the bank's site — these also show a Sep 3/1, 2026 effective
date, but the numbers for every tenure this app already tracks (3/12/24/36mo
FDR at the <50 Lac tier) are unchanged from what was stored, so no update
needed there; it happened to land on the same figures as the prior sheet.

Applied to local dev DB, verified (typecheck, lint, test suite, production
build all passed; MTB FDR/DPS values spot-checked against the source PDF
and matched exactly) before promotion to production.

## Routine drift check #2: UCB Islamic rolled, MTB re-rolled (no change), UCB conventional URL refresh (2026-09-11)

Second proactive spot-check of the dated/monthly-rolling sources (UCB
Islamic, UCB conventional, Prime Bank, MTB, plus a new check on BRAC's
ALCO-circular pattern), 6 days after the last one.

**UCB Islamic — genuinely changed.** The rate sheet linked from
`https://www.ucb.com.bd/rates/interest-rates/` rolled from
`ucb-islamic-rate-sheet-july-2026.pdf` to `...-august-2026.pdf` (verified:
different genuine PDF, 1,004,186 bytes vs July's 1,010,490). Real drift,
every tenure rose — "General Product (Retail)", Aug-26 column:
- FDR (Mudaraba Term Deposit): 1mo 3.79%→3.98%, 3/6/12/24/36mo
  8.06%→8.45% flat.
- DPS (Mudaraba Monthly DPS): 3yr 7.59%→7.95%, 5/7/10yr 8.06%→8.45% flat.

**UCB conventional — numbers unchanged, source URL only.** UCB's linked
circular moved from the old `instruction-circular-no1632full-...` filename
to `instruction-circular-no1632-1633full-...pdf` (dated inside the
document September 1, 2026). Read the new 11-page PDF directly and
confirmed every tracked figure is identical to what was stored: Earning
Plus FD (Regular, Quarterly, prefix 3428) still 9.50% at 1-3yr / 8.25% at
4-10yr; Super Flex DPS (Regular, prefixes 3550/3580/3581/3582) still
9.50%/9.75%/10.00%/10.00%. Updated only the source URL for traceability —
this is exactly the kind of case the transactional-import-script's design
anticipates (re-running with unchanged numbers is a safe no-op on the
data, just refreshes the citation).

**Prime Bank — still current**, confirmed via the earlier research agent
pass (Aug-31-2026 sheet, no newer PDF found).

**MTB Islamic — re-rolled again, numbers unchanged.** The PDF moved from
`Profit-on-Deposit-Latest-Sep-26v2.pdf` to `...-Sep-v3.pdf` (effective
date for the Term Deposit/Institutional tables moved Sep 3→Sep 10, 2026;
Savings Schemes/Benefit Plans stayed at Sep 2). Read the new 6-page PDF
directly and confirmed every tracked FDR and DPS-equivalent figure is
byte-for-byte the same as the v2 sheet already in the database. Updated
source URLs only, no rate changes.

**BRAC Bank — confirmed still current, one false lead caught and
discarded.** The stored Aug-25-2026 ALCO Circular 2026/07 PDF was
re-verified genuine and still the latest. A search result appearing to be
a "September 03, 2026" rollover
(`BRAC_Bank_Deposit_Interest_Rate_w.e.f._September_03,_202568b6d71f5c545.pdf`)
was fetched and found to actually be a *year-old*, mislabeled document —
its real printed header reads "ALCO Circular: 2025/05, Effective Date:
September 03, **2025**," not 2026. Correctly not treated as a real
rollover; flagged here so a future check doesn't fall for the same
stale/mislabeled search-cache URL.

Applied to local dev DB, verified (typecheck, lint, test suite, production
build all passed; UCB Islamic FDR/DPS values spot-checked against the
source PDF and matched exactly) before promotion to production.

## BRAC Bank rolled to ALCO Circular 2026/09 (2026-09-18)

The 2026-09-11 pass reported BRAC as "still current" and flagged a
suspicious search result as a false lead. That call was right about the
false lead but wrong about currency: BRAC **has** since published a real
new circular, and the automated pass missed it because it searched rather
than reading the bank's own page.

**Method note (why this was missed before, and how to avoid repeating
it):** the correct source is the PDF link embedded in
`https://www.bracbank.com/en/page/deposit-interest-rate` — extract the
`.pdf` href from that page's HTML and fetch it. Do NOT rely on search
results for BRAC: its S3 filenames are unreliable as dating evidence, and
one cached result had a filename saying 2026 while the document inside was
the 2025/05 circular. Always confirm against the `ALCO Circular: <n>` and
`Effective Date:` header printed on page 1 of the PDF itself.

**Current source:** ALCO Circular 2026/09, Effective Date September 13,
2026 —
`https://brackweb.s3.ap-southeast-1.amazonaws.com/uploads/all/BRAC_Bank_Deposit_Interest_Rate_13.09.20266aa159b705cdd.pdf`
(read directly; header verified). Supersedes 2026/07 (Aug 25, 2026).

Real drift in both tracked products:
- **Retail Monthly Interest FD (FRABR)** — down 0.50pp at every tenure:
  6mo 8.00%→7.50%; 12/24/36/60/84mo 8.25%→7.75%. Published tenure list
  unchanged (6/12/14/18/24/36/60/84mo).
- **FRFLX DPS** — the band structure itself changed, not just the values.
  Previously Yr1 8.50%, Yr2 8.75%, then flat 9.00% from Yr3 onward. Now a
  rising ladder that doesn't reach 8.00% until Yr5: Yr1 7.00%, Yr2 7.25%,
  Yr3 7.50%, Yr4 7.75%, Yr5-9 8.00%, Yr10 8.25%. Added a 48mo (Yr4) row,
  which the old flat-from-Yr3 shape made redundant but the new ladder makes
  a distinct rate — BRAC DPS went from 6 to 7 tiers.

Applied to local dev DB, verified (typecheck, lint, 34 tests, production
build all passed; every BRAC FDR/DPS value read back from the database and
matched against the circular one-for-one) before promotion to production.
