-- Enable Row-Level Security on Prisma's own migration-bookkeeping table.
--
-- The 20260911000000_enable_row_level_security migration covered all 11
-- application tables, but `_prisma_migrations` is created by Prisma itself
-- (outside any migration file), so it was missed and stayed the last
-- ERROR-level finding in Supabase's security advisors: it sits in the
-- public schema, so PostgREST exposes it just like any other table.
--
-- Leaking it is not as severe as leaking AdminUser, but it still hands an
-- anonymous caller the full migration history -- every migration name,
-- timestamp, checksum, and applied/rolled-back state -- which maps out the
-- schema's evolution and tells an attacker exactly what this database is
-- and when it last changed. No reason to publish that.
--
-- As with the earlier migration: this app connects via Prisma using the
-- `postgres` superuser role, which bypasses RLS regardless of policies, so
-- enabling RLS with zero policies (default-deny) closes the endpoint
-- without affecting migrations or the app in any way.

-- Guarded with to_regclass: `_prisma_migrations` is created by Prisma
-- itself rather than by a migration, so it does NOT exist in the shadow
-- database Prisma spins up to validate migrations. A bare ALTER TABLE here
-- fails shadow-db validation (P3006/P1014); this makes the statement a
-- no-op there while still applying against real databases.
DO $$
BEGIN
  IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY';
  END IF;
END
$$;
