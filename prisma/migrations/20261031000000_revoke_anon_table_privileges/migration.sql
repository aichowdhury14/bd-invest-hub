-- Defence in depth for the PostgREST-exposed roles.
--
-- Supabase grants `anon` and `authenticated` full table privileges in `public` by
-- default, so until now row-level security was the only thing standing between the
-- public publishable key and every row in this database. That worked for reads and
-- writes -- RLS is enabled with zero policies, so it denies by default -- but TRUNCATE
-- is *not* filtered by RLS. A single TRUNCATE from the public key would have emptied
-- the verified rate tables outright.
--
-- The app itself connects as `postgres`, which owns these tables and bypasses RLS, so
-- nothing it does depends on these grants. Revoking them costs nothing and removes the
-- TRUNCATE hole while leaving RLS in place as the second layer.
--
-- Also revoke the default privileges for future tables, otherwise the next `prisma
-- migrate` hands the same grants straight back.

-- `anon` and `authenticated` only exist on Supabase. Skip everything on a plain
-- Postgres (local dev, and the shadow database `prisma migrate dev` replays every
-- migration into), where a REVOKE naming a missing role is an error.
DO $$
DECLARE
  t text;
BEGIN
  IF (SELECT count(*) FROM pg_roles WHERE rolname IN ('anon', 'authenticated')) < 2 THEN
    RETURN;
  END IF;

  FOR t IN SELECT unnest(ARRAY[
    'AdminUser', 'CalculatorEvent', 'CompareEvent', 'Institution',
    'PageViewEvent', 'ProfitSharingRatio', 'RateDriftFlag', 'RateHistory',
    'RateProduct', 'RateTier', 'ScrapeLog', '_prisma_migrations'
  ]) LOOP
    IF to_regclass(format('public.%I', t)) IS NOT NULL THEN
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', t);
    END IF;
  END LOOP;

  -- Sequences are not used by the public roles either.
  REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

  -- Stop future Prisma-created tables from inheriting the grants again.
  ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
END $$;
