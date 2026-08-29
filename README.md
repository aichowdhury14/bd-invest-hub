# BD Invest Hub

A free investment comparison platform for Bangladesh — compare FDR, DPS, Sanchayapatro,
Treasury instruments, and investment-organization products across banks, Bangladesh Bank
instruments, and NBFIs, then calculate exactly what your money grows into.

Live site: https://bd-invest-hub.vercel.app

## Core principle: no fabricated numbers

Every rate shown carries a source — `MANUAL` (entered by the admin from a bank's published
rate sheet/circular) or `SCRAPED` (from an automated check), with a source URL and a
last-updated timestamp. Where a figure can't be verified, it's left empty rather than guessed.
This discipline extends to every feature below: recommendations and the trending list only
ever surface numbers computed from real stored rate data or real logged usage — nothing here
is invented or predicted.

## Features

- **Calculator** (`/calculator`) — amount + tenure → live maturity comparison across every
  tracked product, with risk-profile-based "Smart Recommendations," net-of-tax and
  inflation-adjusted figures, and a growth chart.
- **Compare** (`/compare`) — side-by-side comparison of up to 6 selected products.
- **Market Insights** (`/insights`) — rate heatmaps and leaderboards across institutions.
- **Homepage** (`/`) — institutions grouped by type with current best rates, plus a
  **Trending** widget showing the most-calculated/compared products this week (built from
  real anonymous usage events; hidden until there's enough real activity to be meaningful).
- **Admin panel** (`/admin`, session-protected) — full CRUD for institutions/products/rate
  tiers, a usage analytics dashboard, scrape-run logs, and a **Rate Drift Review** page:
  when a scraper detects a rate that differs from what's stored, it's staged as a pending
  flag for a human to approve or reject — nothing from a scraper ever overwrites live data
  automatically.

## Tech stack

- **Framework**: Next.js 16 (App Router, Turbopack), TypeScript, React 19
- **Database**: PostgreSQL via Prisma ORM (Supabase free tier in production)
- **Auth**: NextAuth v5, credentials provider, bcrypt-hashed admin passwords, JWT sessions,
  route protection via `proxy.ts` (Next.js 16's replacement for `middleware.ts`)
- **UI**: Tailwind CSS, Recharts, lucide-react
- **Scraping**: Cheerio-based scraper framework (`scripts/scrapers/`), scheduled daily via
  GitHub Actions — see [Scraping & rate monitoring](#scraping--rate-monitoring) below
- **Hosting**: Vercel (free tier), auto-deploys on push to `master`
- **Testing**: Vitest (unit tests for interest/DPS calculations and recommendation ranking)

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL / DIRECT_URL / AUTH_SECRET / AUTH_URL
npx prisma migrate dev
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=yourpassword npm run db:seed
npm run dev
```

Visit `http://localhost:3000`, and `http://localhost:3000/admin/login` for the admin panel.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` / `npm run start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run db:migrate` | Create + apply a new Prisma migration (dev only) |
| `npm run db:seed` | Seed institutions/products and the first admin user |
| `npm run import-rates` | Re-import manually sourced rate data (see `scripts/import-real-rates.ts`) |
| `npm run scrape` | Run registered scrapers (`scripts/scrapers/run-all.ts`) |
| `npm run snapshot-history` | Snapshot current rates into `RateHistory` for future trend features |

## Scraping & rate monitoring

Scrapers implement the `Scraper` interface in `scripts/scrapers/types.ts` and are registered
in `scripts/scrapers/run-all.ts`. A scraper never writes directly to live rate data — any
difference it finds from what's currently stored is written as a `RateDriftFlag` (pending
review) via `scripts/scrapers/runner.ts`. An admin reviews and approves or rejects each flag
from `/admin/rate-drift` before it becomes a live rate. See
`scripts/scrapers/template-bank-scraper.ts` for a starting point when adding a new scraper.

## Deployment

Hosted on Vercel (free Hobby tier) with a Supabase Postgres database, connected via GitHub —
pushing to `master` auto-deploys. `.github/workflows/scrape.yml` and
`.github/workflows/snapshot-history.yml` run the scraper and rate-history snapshot daily via
GitHub Actions (free for this repo). See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the full
free-tier deployment walkthrough (GitHub + Supabase + Vercel).

## Disclaimer

All figures are informational. Verify current rates directly with the institution before
making an investment decision.
