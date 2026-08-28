# BD Invest Hub

Compare FDR, DPS, Sanchaypatro, treasury and investment-organization rates across
Bangladesh, calculate maturity amounts, and manage everything from an admin panel
with usage analytics. See `DEPLOYMENT.md` for how to put this online for free.

## Stack

- Next.js 16 (App Router, TypeScript), Tailwind CSS
- Postgres via Prisma (targets Supabase's free tier)
- NextAuth (Auth.js) credentials login for the admin panel
- Recharts for the admin analytics dashboard
- Self-hosted, PII-free usage analytics (`PageViewEvent` / `CalculatorEvent`)
- A hand-rolled PWA (manifest + service worker) — installable on mobile with no
  app store
- A scraper framework (`scripts/scrapers/`) that runs on a schedule via GitHub
  Actions and writes into the same database, as a fallback-safe companion to the
  admin panel's manual rate entry

## Local development

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL / DIRECT_URL / AUTH_SECRET / AUTH_URL
npm run db:generate
npm run db:migrate     # creates tables
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=choose-a-password npm run db:seed
npm run dev
```

Visit `http://localhost:3000` for the public site and `http://localhost:3000/admin/login`
for the admin panel (use the email/password you seeded above).

## Testing

```bash
npm test        # unit tests for the interest/DPS calculation math
npm run build   # full production build (also runs the TypeScript check)
```

## Data model & honesty about rates

Every `RateTier` carries a `source` (`MANUAL` or `SCRAPED`), an optional
`sourceUrl`, and timestamps. The seed script only attaches real numbers to one
clearly-labeled "Demo Bank (Sample Data — Replace Me)" institution — every real
bank/government/investment-org institution is seeded with no rates at all. Add
real, verified rates through `/admin/institutions`, or build scrapers (see
`scripts/scrapers/template-bank-scraper.ts`) for institutions that publish clean
HTML rate tables.

## Project structure

```
src/app/                      public pages: /, /calculator, /compare
src/app/admin/                admin panel (login + protected dashboard/institutions/scrape-logs)
src/lib/calculations.ts       interest/DPS math (unit tested)
src/lib/admin-actions.ts      server actions for admin CRUD
src/lib/analytics*.ts         usage tracking + dashboard aggregation queries
prisma/schema.prisma          data model
prisma/seed.ts                seed script (institution shells, no fabricated rates)
scripts/scrapers/             scraper framework + GitHub Actions workflow
```
