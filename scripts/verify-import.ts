// Confirms the database holds exactly the rates in scripts/import-real-rates.ts:
// every MANUAL tier compared row by row (institution, type, tenure, amount
// band, rate, source). Exits 1 on any mismatch. Run right after
// `npm run import-rates`; the import-rates workflow does.
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const LAC = 100_000;
const CRORE = 10_000_000;
const ROW =
  /^ {2}\{ institutionName: "([^"]+)", productType: "([A-Z]+)", (?:productNameHint: "[^"]+", )?tenureMonths: (\d+), minAmount: ([^,]+), (?:maxAmount: ([^,]+), )?interestRatePct: ([\d.]+), sourceUrl: "([^"]*)" \},$/;

// Only `N`, `N * LAC` and `N * CRORE` appear in the file.
function amount(expr: string): number {
  const m = expr.trim().match(/^([\d_.]+)(?:\s*\*\s*(LAC|CRORE))?$/);
  if (!m) throw new Error(`Unrecognised amount expression: ${expr}`);
  return Math.round(Number(m[1].replace(/_/g, "")) * (m[2] === "LAC" ? LAC : m[2] === "CRORE" ? CRORE : 1));
}

// The column is Decimal(6,3) and Postgres rounds half-up in decimal, so do the
// same: 8.2875 is stored as 8.288, but (8.2875).toFixed(3) gives "8.287"
// because the double is 8.28749999...
const to3dp = (r: number) => (Math.round(Number((r * 1000).toPrecision(12))) / 1000).toFixed(3);
const key = (inst: string, type: string, tenure: number, min: number, max: number | null, rate: number, url: string) =>
  [inst, type, tenure, min, max ?? "", to3dp(rate), url].join(" | ");

function count(keys: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const k of keys) m.set(k, (m.get(k) ?? 0) + 1);
  return m;
}

function missing(from: Map<string, number>, to: Map<string, number>): string[] {
  return [...from].flatMap(([k, n]) => Array(Math.max(0, n - (to.get(k) ?? 0))).fill(k) as string[]);
}

async function main() {
  const fileKeys: string[] = [];
  for (const line of readFileSync("scripts/import-real-rates.ts", "utf8").split(/\r?\n/)) {
    const m = line.match(ROW);
    if (!m) continue;
    const [, inst, type, tenure, min, max, rate, url] = m;
    fileKeys.push(key(inst, type, Number(tenure), amount(min), max ? amount(max) : null, Number(rate), url));
  }

  const prisma = new PrismaClient();
  try {
    const tiers = await prisma.rateTier.findMany({
      where: { source: "MANUAL" },
      select: {
        tenureMonths: true,
        minAmount: true,
        maxAmount: true,
        interestRatePct: true,
        sourceUrl: true,
        product: { select: { productType: true, institution: { select: { name: true } } } },
      },
    });
    const dbKeys = tiers.map((t) =>
      key(
        t.product.institution.name,
        t.product.productType,
        t.tenureMonths,
        Math.round(Number(t.minAmount)),
        t.maxAmount === null ? null : Math.round(Number(t.maxAmount)),
        Number(t.interestRatePct),
        t.sourceUrl ?? ""
      )
    );

    const f = count(fileKeys);
    const d = count(dbKeys);
    const notInDb = missing(f, d);
    const notInFile = missing(d, f);
    console.log(`File rows: ${fileKeys.length}. Database MANUAL tiers: ${dbKeys.length}.`);
    if (!notInDb.length && !notInFile.length) {
      console.log("Database matches the file exactly.");
      return;
    }
    notInDb.forEach((k) => console.error(`In file, not in database: ${k}`));
    notInFile.forEach((k) => console.error(`In database, not in file: ${k}`));
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
