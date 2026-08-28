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

### Pubali Bank — CONFIRMED still blocked
Tried r.jina.ai proxy + direct fetch on 5 different URLs (main rate page, 2 PDF variants, legacy site, alternate product page) — Cloudflare bot-challenge (403/CAPTCHA) held on every single path, unlike City Bank which the same proxy technique successfully cracked. Genuinely inaccessible with available tools. Google's snippet index confirms a real rate table exists in their PDF but none of it could be read. Still NOT FOUND — would need a human to open it in a real browser, or the bank's API/call center.

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
Several sources carry caution flags (DBBL 2021 circular basis, MTB Sept 2024 effective dates, NCC SSS Nov 2020, LankaBangla Apr 2025, BRAC/Dhaka Bank table extraction ambiguity) — noted inline above; entering these as MANUAL source with the sourceUrl preserved so anyone can re-verify.
