-- Enable Row-Level Security on every table.
--
-- This app connects to Postgres directly via Prisma using the `postgres`
-- superuser role (see DATABASE_URL), which bypasses RLS entirely regardless
-- of policies -- so this migration changes nothing about how the app
-- itself reads or writes data.
--
-- What it does fix: Supabase auto-exposes every public-schema table over
-- PostgREST (https://<project>.supabase.co/rest/v1/<table>) using a public
-- "anon" API key that ships with every Supabase project. Without RLS
-- enabled, that endpoint allows ANYONE who finds the project URL to read,
-- edit, or delete every row in every table -- including AdminUser's
-- password hashes -- completely bypassing this app. No policies are
-- created below (deliberately default-deny): nothing legitimate talks to
-- PostgREST, so the correct policy is "no anon/authenticated access at
-- all," which is exactly what RLS-enabled-with-zero-policies produces.

ALTER TABLE "Institution" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RateProduct" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RateTier" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProfitSharingRatio" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RateHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ScrapeLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CalculatorEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PageViewEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CompareEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdminUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RateDriftFlag" ENABLE ROW LEVEL SECURITY;
