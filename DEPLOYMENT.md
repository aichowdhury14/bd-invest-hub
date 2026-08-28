# Deploying BD Invest Hub for free

This deploys the web app to Vercel (free Hobby tier), the database to Supabase
(free tier Postgres), and the scheduled rate scraper to GitHub Actions (free for
public repos, and free minutes are generous for private repos too). Total cost: $0.

## 1. Create the database (Supabase)

1. Go to supabase.com and create a free account + a new project (pick a strong
   database password and save it).
2. In the project, go to **Project Settings → Database → Connection string**.
   - Copy the **URI** under "Connection pooling" (port `6543`) → this is your
     `DATABASE_URL`.
   - Copy the **URI** under "Direct connection" (port `5432`) → this is your
     `DIRECT_URL`. Prisma needs this direct connection to run migrations, since
     the pooled connection doesn't support them.
3. Both look like `postgresql://postgres:[password]@[host]:[port]/postgres`.

## 2. Push the code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
```

Create a new repository on GitHub (public is fine and gives free GitHub Actions
minutes for the scraper), then:

```bash
git remote add origin https://github.com/<you>/bd-invest-hub.git
git branch -M main
git push -u origin main
```

## 3. Apply the database schema and seed it

Locally, with the Supabase URLs from step 1:

```bash
DATABASE_URL="<pooled-uri>" DIRECT_URL="<direct-uri>" npx prisma migrate deploy
ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="choose-a-strong-password" \
  DATABASE_URL="<pooled-uri>" DIRECT_URL="<direct-uri>" npm run db:seed
```

This creates the tables, your admin login, and the institution/product shells
(with **no fabricated rates** — see the README's "Data honesty" note). Add real
verified rates afterwards from `/admin/institutions`.

## 4. Deploy to Vercel

1. Go to vercel.com, sign in with GitHub, and "Import" the repository.
2. Framework preset: Next.js (auto-detected).
3. Add environment variables (Project Settings → Environment Variables):
   - `DATABASE_URL` — the pooled Supabase URI
   - `DIRECT_URL` — the direct Supabase URI
   - `AUTH_SECRET` — generate one with `openssl rand -base64 32`
   - `AUTH_URL` — your production URL, e.g. `https://bd-invest-hub.vercel.app`
     (Vercel gives you this domain for free; you can add a custom domain later.)
4. Deploy. `postinstall` runs `prisma generate` automatically, and the build
   reads live data from Supabase (`revalidate = 300` on the public pages, so
   pages refresh at most every 5 minutes without needing a full redeploy).

Your site is now live at the `*.vercel.app` URL and installable as a PWA on
mobile: open it in Chrome (Android) or Safari (iOS) and use "Add to Home Screen."

## 5. Wire up the scheduled scraper (optional, once you've built real scrapers)

The GitHub Actions workflow at `.github/workflows/scrape.yml` already runs daily
and calls `scripts/scrapers/run-all.ts`. It needs the same DB credentials as
secrets:

1. In the GitHub repo: **Settings → Secrets and variables → Actions → New
   repository secret**.
2. Add `DATABASE_URL` and `DIRECT_URL` with the same Supabase values from step 1.
3. The workflow runs on its schedule, or trigger it manually from the Actions tab
   ("Run workflow") to test it.

Until real per-bank scrapers are registered in `scripts/scrapers/run-all.ts`
(see `template-bank-scraper.ts`), this workflow runs and logs "no scrapers
registered" — harmless, and ready to extend.

## 6. Ongoing admin use

- `/admin/login` — sign in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you seeded.
- `/admin/institutions` — add/edit/hide institutions, products, and rate tiers.
- `/admin/dashboard` — visitors, page views, and calculator usage over the last
  14 days.
- `/admin/scrape-logs` — health of the scheduled scraper runs.
- **Before telling people to use the site for real decisions**: delete or hide
  the seeded "Demo Bank (Sample Data — Replace Me)" institution, and fill in
  verified rates for the real institutions.

## Free-tier limits worth knowing

- **Supabase free tier**: project pauses after 1 week of no API activity (an
  admin login or any page load resets the clock); 500MB database storage, which
  is far more than this schema needs.
- **Vercel Hobby tier**: generous free bandwidth/build minutes for a personal
  project; no credit card required.
- **GitHub Actions**: unlimited minutes on public repos; 2,000 free minutes/month
  on private repos, and a once-daily scrape job uses only a few minutes a month.
