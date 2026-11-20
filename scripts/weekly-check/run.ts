// Weekly health check for the rate data and the live site. Detects; never
// edits rates. Every stored rate must trace to a document a human has read
// (see research/rate-research-2026-08-28.md), so when a source changes this
// reports where to look and the re-verification stays a deliberate step.
//
//   npm run weekly-check                      report only
//   npm run weekly-check -- --update-baseline also record today's source
//                                             fingerprints as "verified"
//   npm run weekly-check -- --verified <url> [--verified <url> ...]
//   npm run weekly-check -- --verified-file <file of URLs, one per line>
//                                             mark only these sources verified
//
// Mark a source verified only after its document has been re-read and the
// rates file updated (or confirmed unchanged) -- otherwise a real change gets
// accepted unread. Prefer --verified over --update-baseline: the import
// workflow passes exactly the URLs a commit touched.
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { extraFingerprintTargets, listingWatches, sitePages } from "./watchlist";

const SITE = process.env.SITE_URL ?? "https://bd-invest-hub.vercel.app";
const RATES_FILE = "scripts/import-real-rates.ts";
const BASELINE_FILE = "monitoring/baseline.json";
const REPORT_FILE = "monitoring/weekly-report.md";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";
// Thresholds, in days unless named otherwise.
const SNAPSHOT_STALE_HOURS = 36;
const RATES_REVERIFY_DAYS = 35;
const SLOW_PAGE_MS = 3000;

const argv = process.argv.slice(2);
const updateAll = argv.includes("--update-baseline");
const verifiedUrls = new Set<string>();
argv.forEach((arg, i) => {
  if (arg === "--verified" && argv[i + 1]) verifiedUrls.add(argv[i + 1]);
  if (arg === "--verified-file" && argv[i + 1] && existsSync(argv[i + 1]))
    readFileSync(argv[i + 1], "utf8")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach((u) => verifiedUrls.add(u));
});
const updateBaseline = updateAll || verifiedUrls.size > 0;
const accepts = (url: string) => updateAll || verifiedUrls.has(url);

type Level = "action" | "blocked";
interface Finding {
  level: Level;
  area: string;
  text: string;
}
const findings: Finding[] = [];
const healthy: string[] = [];
const flag = (level: Level, area: string, text: string) => findings.push({ level, area, text });

// ---------- fetching ----------

interface Fetched {
  status: number;
  contentType: string;
  body: Buffer;
  ms: number;
}

async function get(url: string): Promise<Fetched | { error: string }> {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "*/*", "Accept-Language": "en-US,en;q=0.9" },
      redirect: "follow",
      signal: AbortSignal.timeout(45_000),
    });
    const body = Buffer.from(await res.arrayBuffer());
    return { status: res.status, contentType: res.headers.get("content-type") ?? "", body, ms: Date.now() - started };
  } catch (err) {
    const cause = err instanceof Error && err.cause instanceof Error ? `: ${err.cause.message}` : "";
    return { error: `${err instanceof Error ? err.message : String(err)}${cause}` };
  }
}

// Captcha and bot walls seen on BD bank sites. They often answer 200 with a
// page big enough to pass a size check (Bangladesh Bank's is ~45 KB), so
// match on the text.
const BLOCK_PATTERNS =
  /testing whether you are a human|What code is in the image|<title>Just a moment|Security check required|Request Rejected/i;

// Answers that mean "this network may not look", not "the document is gone":
// GitHub's US runners time out on some BD hosts (Islami Bank, Janata) and get
// 403 from others (UCB) that serve normally from Bangladesh.
const REFUSED_STATUS = new Set([401, 403, 429, 451, 503]);
const refusedText = (error: string) =>
  `Unreachable from the checker's network (${error}); check from Bangladesh or a browser`;

const isPdf = (f: Fetched) => f.contentType.includes("pdf") || f.body.subarray(0, 5).toString() === "%PDF-";
const text = (f: Fetched) => f.body.toString("utf8");
const sha = (s: string | Buffer) => createHash("sha256").update(s).digest("hex").slice(0, 16);

/**
 * What "the rates on this source" look like, as a short comparable string.
 * PDFs: a hash of the bytes. HTML/JSON: a hash of every decimal percentage in
 * the document, in order -- rates are the only thing we care about, and this
 * ignores the layout, news tickers and build hashes that churn every deploy.
 */
function fingerprint(f: Fetched): string {
  if (isPdf(f)) return `pdf:${sha(f.body)}`;
  const body = text(f).replace(/<style[\s\S]*?<\/style>/gi, "");
  const pcts = body.match(/(?<![\d.])\d{1,2}\.\d{1,3}\s?%/g)?.map((p) => p.replace(/\s/g, "")) ?? [];
  return pcts.length ? `pct:${pcts.length}:${sha(pcts.join(","))}` : `nopct:${sha(body)}`;
}

async function pool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    })
  );
  return out;
}

// ---------- sources ----------

/** sourceUrl -> institutions citing it, read straight from the import file. */
function storedSources(): Map<string, Set<string>> {
  const src = readFileSync(RATES_FILE, "utf8");
  const map = new Map<string, Set<string>>();
  for (const m of src.matchAll(/institutionName: "([^"]+)"[^\n]*?sourceUrl: "(https?:[^"]+)"/g)) {
    const set = map.get(m[2]) ?? new Set<string>();
    set.add(m[1]);
    map.set(m[2], set);
  }
  return map;
}

/** One spelling per document, so a page's href and our stored URL compare equal. */
function normalizeUrl(raw: string, page: string): string {
  let u = raw.replace(/\\\//g, "/").replace(/&amp;/g, "&");
  if (!/^https?:/i.test(u)) u = new URL(u.replace(/^\/+/, ""), new URL(page).origin + "/").href;
  u = u.replace(/\/\.\//g, "/");
  try {
    return decodeURI(u);
  } catch {
    return u;
  }
}

interface Baseline {
  updatedAt: string | null;
  fingerprints: Record<string, string>;
}

function loadBaseline(): Baseline {
  if (!existsSync(BASELINE_FILE)) return { updatedAt: null, fingerprints: {} };
  return JSON.parse(readFileSync(BASELINE_FILE, "utf8")) as Baseline;
}

async function checkSources(sources: Map<string, Set<string>>, baseline: Baseline, fresh: Record<string, string>) {
  const targets = [
    ...[...sources].map(([url, insts]) => ({ key: url, url, label: [...insts].join(", ") })),
    ...extraFingerprintTargets.map((t) => ({ key: t.url, url: t.url, label: t.label })),
  ];
  let ok = 0;
  let readable = 0;
  await pool(targets, 6, async ({ key, url, label }) => {
    const res = await get(url);
    if ("error" in res) return flag("blocked", label, `${refusedText(res.error)}: ${url}`);
    if (BLOCK_PATTERNS.test(isPdf(res) ? "" : text(res)))
      return flag("blocked", label, `Behind a captcha/bot wall, not checked: ${url}`);
    if (REFUSED_STATUS.has(res.status)) return flag("blocked", label, `${refusedText(`HTTP ${res.status}`)}: ${url}`);
    readable++;
    if (res.status !== 200) return flag("action", label, `Source returns HTTP ${res.status}: ${url}`);
    if (/\.pdf($|\?)/i.test(url) && !isPdf(res))
      return flag("action", label, `PDF link now serves ${res.contentType || "non-PDF content"}: ${url}`);

    const fp = fingerprint(res);
    fresh[key] = fp;
    const before = baseline.fingerprints[key];
    if (!before) return flag("action", label, `No verified fingerprint yet (run with --update-baseline once verified): ${url}`);
    if (before !== fp) return flag("action", label, `Rates on this source changed since last verified: ${url}`);
    ok++;
  });
  healthy.push(`${ok}/${targets.length} sources unchanged since last verification`);
  // Individual banks block us; most of them at once means the checker's own
  // network is restricted (a sandbox with no outbound access put all 56 under
  // "could not check" on 2026-11-20). That week's result proves nothing.
  if (readable < targets.length / 2)
    flag(
      "action",
      "Checker",
      `Only ${readable}/${targets.length} sources were readable; this run's network is probably restricted, so this week was not actually checked`
    );
}

async function checkListings(sources: Map<string, Set<string>>) {
  const known = new Set([...sources.keys()].map((u) => normalizeUrl(u, u)));
  let ok = 0;
  await pool(listingWatches, 4, async (w) => {
    const res = await get(w.page);
    if ("error" in res) return flag("blocked", w.institution, `${refusedText(res.error)}: ${w.page}`);
    const body = text(res);
    if (BLOCK_PATTERNS.test(body)) return flag("blocked", w.institution, `Listing page behind a captcha: ${w.page}`);
    if (REFUSED_STATUS.has(res.status))
      return flag("blocked", w.institution, `${refusedText(`HTTP ${res.status}`)}: ${w.page}`);
    if (res.status !== 200) return flag("action", w.institution, `Listing page returns HTTP ${res.status}: ${w.page}`);

    const links = [...new Set([...body.matchAll(w.pattern)].map((m) => normalizeUrl(m[0], w.page)))];
    if (!links.length)
      return flag("action", w.institution, `No rate document found on the listing page (layout changed?): ${w.page}`);
    const current = w.pick === "all" ? links : w.pick === "first" ? [links[0]] : [links.sort().at(-1)!];
    const unseen = current.filter((l) => !known.has(l));
    if (unseen.length)
      return unseen.forEach((l) => flag("action", w.institution, `Newer rate document published: ${encodeURI(l)}`));
    ok++;
  });
  healthy.push(`${ok}/${listingWatches.length} banks still link the document we cite`);
}

// ---------- live site ----------

async function checkSite() {
  let ok = 0;
  for (const { path, rates } of sitePages) {
    const url = SITE + path;
    await get(url); // first hit can be a cold start or a cache refill
    const res = await get(url);
    if ("error" in res) {
      flag("action", "Live site", `${path} failed: ${res.error}`);
      continue;
    }
    if (res.status !== 200) flag("action", "Live site", `${path} returns HTTP ${res.status}`);
    else if (rates && !/\d\.\d+\s?%/.test(text(res))) flag("action", "Live site", `${path} loads but shows no rates`);
    else if (res.ms > SLOW_PAGE_MS) flag("action", "Live site", `${path} is slow: ${res.ms} ms on a warm request`);
    else ok++;
  }
  healthy.push(`${ok}/${sitePages.length} site pages up and fast`);
}

// ---------- database ----------

async function checkDatabase() {
  if (!process.env.DATABASE_URL) {
    flag("blocked", "Database", "DATABASE_URL not set, database checks skipped");
    return;
  }
  const prisma = new PrismaClient();
  try {
    const [stats] = await prisma.$queryRaw<
      { tiers: bigint; institutions: bigint; last_import: Date | null; last_snapshot: Date | null; pending_drift: bigint }[]
    >`
      SELECT
        (SELECT count(*) FROM "RateTier") AS tiers,
        (SELECT count(DISTINCT p."institutionId") FROM "RateTier" t JOIN "RateProduct" p ON p.id = t."productId") AS institutions,
        (SELECT max("updatedAt") FROM "RateTier") AS last_import,
        (SELECT max("recordedAt") FROM "RateHistory") AS last_snapshot,
        (SELECT count(*) FROM "RateDriftFlag" WHERE status = 'PENDING') AS pending_drift`;

    const hours = (d: Date | null) => (d ? (Date.now() - d.getTime()) / 3_600_000 : Infinity);
    const snapshotAge = hours(stats.last_snapshot);
    if (snapshotAge > SNAPSHOT_STALE_HOURS)
      flag("action", "Database", `Rate-history snapshot is ${Math.round(snapshotAge)} h old; the daily job may be failing`);
    const importAgeDays = Math.floor(hours(stats.last_import) / 24);
    if (importAgeDays > RATES_REVERIFY_DAYS)
      flag("action", "Database", `Rates were last imported ${importAgeDays} days ago; a full re-verification is due`);
    if (Number(stats.pending_drift) > 0)
      flag("action", "Database", `${stats.pending_drift} rate-drift flag(s) waiting for review in /admin/rate-drift`);

    // The 2026-10/11 security fixes: RLS on every app table, and no table
    // privileges for the PostgREST roles (RLS does not cover TRUNCATE).
    const [sec] = await prisma.$queryRaw<{ rls_off: string | null; public_grants: bigint }[]>`
      SELECT
        (SELECT string_agg(c.relname, ', ') FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity) AS rls_off,
        (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
          CROSS JOIN LATERAL aclexplode(COALESCE(c.relacl, acldefault('r', c.relowner))) a
          WHERE n.nspname = 'public' AND c.relkind = 'r'
            AND pg_get_userbyid(a.grantee) IN ('anon', 'authenticated')) AS public_grants`;
    if (sec.rls_off) flag("action", "Security", `Row-level security is OFF on: ${sec.rls_off}`);
    if (Number(sec.public_grants) > 0)
      flag("action", "Security", `${sec.public_grants} table privilege(s) granted to anon/authenticated (expected 0)`);

    healthy.push(
      `${stats.tiers} rate tiers across ${stats.institutions} institutions; last import ${importAgeDays} days ago; ` +
        `last snapshot ${Math.round(snapshotAge)} h ago`
    );
  } catch (err) {
    flag("action", "Database", `Database check failed: ${err instanceof Error ? err.message.split("\n")[0] : err}`);
  } finally {
    await prisma.$disconnect();
  }
}

// ---------- report ----------

function report(baseline: Baseline): string {
  const actions = findings.filter((f) => f.level === "action");
  const blocked = findings.filter((f) => f.level === "blocked");
  const byArea = (list: Finding[]) =>
    list
      .sort((a, b) => a.area.localeCompare(b.area))
      .map((f) => `- **${f.area}**: ${f.text}`)
      .join("\n");
  const today = new Date().toISOString().slice(0, 10);
  return [
    `# Weekly rate & site check: ${today}`,
    "",
    actions.length
      ? `**${actions.length} item(s) need attention.** Nothing was changed automatically: re-read each flagged source, update \`${RATES_FILE}\` and push; the import workflow then loads production and marks the touched sources verified.`
      : "**All clear.** Every readable source matches its last verified state.",
    "",
    ...(actions.length ? ["## Needs attention", byArea(actions), ""] : []),
    ...(blocked.length ? ["## Could not check this week (captcha, bot wall or network refusal)", byArea(blocked), ""] : []),
    "## Healthy",
    ...healthy.map((h) => `- ${h}`),
    "",
    `_Baseline last verified: ${baseline.updatedAt ?? "never"}. Site: ${SITE}_`,
  ].join("\n");
}

async function main() {
  const sources = storedSources();
  const baseline = loadBaseline();
  const fresh: Record<string, string> = {};

  await Promise.all([checkSources(sources, baseline, fresh), checkListings(sources), checkSite(), checkDatabase()]);

  if (updateBaseline) {
    // Only accepted sources take today's fingerprint; everything else keeps its
    // last verified one (and anything unreadable today keeps its old one too).
    const accepted = Object.fromEntries(Object.entries(fresh).filter(([url]) => accepts(url)));
    const next: Baseline = {
      updatedAt: new Date().toISOString(),
      fingerprints: Object.fromEntries(
        Object.entries({ ...baseline.fingerprints, ...accepted })
          .filter(([url]) => sources.has(url) || extraFingerprintTargets.some((t) => t.url === url))
          .sort(([a], [b]) => a.localeCompare(b))
      ),
    };
    mkdirSync("monitoring", { recursive: true });
    writeFileSync(BASELINE_FILE, JSON.stringify(next, null, 2) + "\n");
    console.log(`Baseline: accepted ${Object.keys(accepted).length} source(s); ${Object.keys(next.fingerprints).length} total.`);
    // Accepted sources are no longer findings.
    for (let i = findings.length - 1; i >= 0; i--) {
      const url = findings[i].text.match(/https?:\S+$/)?.[0];
      if (/changed since last verified|No verified fingerprint/.test(findings[i].text) && url && accepts(url))
        findings.splice(i, 1);
    }
  }

  const md = report(updateBaseline ? loadBaseline() : baseline);
  mkdirSync("monitoring", { recursive: true });
  writeFileSync(REPORT_FILE, md + "\n");
  console.log(md);

  const attention = findings.filter((f) => f.level === "action").length;
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `attention=${attention}\n`);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + "\n");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
