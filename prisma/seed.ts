import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Well-known, publicly-listed banks operating in Bangladesh. These are institution
// shells only — no interest rates are seeded for them. Real rates must be added by
// an admin (manual entry) or by a scraper (see scripts/scrapers/), each carrying a
// verifiable source, because this app must never show a fabricated number as a real
// rate.
const BANKS = [
  "Sonali Bank",
  "Janata Bank",
  "Agrani Bank",
  "Rupali Bank",
  "Islami Bank Bangladesh",
  "Dutch-Bangla Bank",
  "BRAC Bank",
  "Eastern Bank",
  "Prime Bank",
  "Dhaka Bank",
  "The City Bank",
  "Mutual Trust Bank",
  "Pubali Bank",
  "Uttara Bank",
  "NCC Bank",
  "Bank Asia",
  "Trust Bank",
  "Southeast Bank",
  "IFIC Bank",
  "United Commercial Bank",
  "Jamuna Bank",
];

// Islamic banking division/window brand names, for banks confirmed via
// Bangladesh Bank's Quarterly Report on Islamic Banking (Dec 2024 data,
// cross-checked against each bank's own site) to run Islamic banking
// alongside their conventional business. "Islami Bank Bangladesh" is handled
// separately above (it's fully Islamic, not a window). Dutch-Bangla Bank,
// BRAC Bank, and Uttara Bank confirmed to have no Islamic banking. Janata
// Bank has regulatory approval but had not launched as of the most recent
// official data, so it's intentionally left out here.
const ISLAMIC_BANKING_BRANDS: Record<string, string> = {
  "Sonali Bank": "Sonali Bank Islami Banking",
  "Agrani Bank": "Agrani Islamic Banking",
  "Rupali Bank": "Rupali Islamic Banking",
  "Eastern Bank": "EBL Islamic Banking",
  "Prime Bank": "Prime Bank Islamic Banking",
  "Dhaka Bank": "Tayyebah Dhaka Islamic Banking",
  "The City Bank": "City Islamic",
  "Mutual Trust Bank": "MTB Yaqeen",
  "Pubali Bank": "Pubali Islamic Banking",
  "NCC Bank": "NCC Islamic Banking",
  "Bank Asia": "Bank Asia Islamic Banking",
  "Trust Bank": "Trust Islamic Banking",
  "Southeast Bank": "Southeast Bank Islamic Banking",
  "IFIC Bank": "IFIC Islamic",
  "United Commercial Bank": "UCB Taqwa",
  "Jamuna Bank": "Jamuna Islami Banking",
};

// Shanta Asset Management was deliberately left out: it's a mutual fund manager,
// not a deposit-taking institution, so it has no FDR/DPS-style guaranteed rate —
// see research/rate-research-2026-08-28.md for the analysis of its actual
// (variable, NAV-based) returns instead.
const INVESTMENT_ORGS = ["IPDC Finance Limited", "LankaBangla Finance", "IDLC Finance"];

// Fully digital-only banking brands (app-only, no branches) operated by a
// licensed commercial bank — same regulator/deposit protections as a
// traditional bank, distinct enough as a category that users comparing
// options may want to see it separately. Prime NOW is Prime Bank PLC's own
// digital sub-brand (https://primenow.ai), confirmed via Google Play's
// "Android Apps by Prime Bank PLC" developer listing — not a separate
// legal entity from the already-tracked "Prime Bank".
const DIGITAL_BANKS = ["Prime NOW"];

async function main() {
  // --- Admin user -----------------------------------------------------------
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables before seeding, e.g.\n" +
        "  ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=your-password npm run db:seed"
    );
  }
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, passwordHash, role: "OWNER" },
  });
  console.log(`Admin user ready: ${adminEmail}`);

  // --- Banks (structure only, no rates) --------------------------------------
  for (const name of BANKS) {
    const inst = await prisma.institution.upsert({
      where: { id: `bank-${slug(name)}` },
      update: {},
      create: { id: `bank-${slug(name)}`, name, type: "BANK" },
    });
    // Islami Bank Bangladesh is a full-fledged Islamic bank -- its "conventional"
    // FDR/DPS shells are actually its standard Mudaraba products, so they're
    // flagged isIslamic here rather than getting duplicate Islamic-only shells.
    const isFullyIslamic = name === "Islami Bank Bangladesh";
    await ensureProductShell(
      inst.id,
      "FDR",
      isFullyIslamic ? "Mudaraba Term Deposit Receipt" : "Fixed Deposit Receipt",
      3,
      36,
      isFullyIslamic
    );
    await ensureProductShell(
      inst.id,
      "DPS",
      isFullyIslamic ? "Mudaraba Deposit Pension Scheme" : "Deposit Pension Scheme",
      12,
      120,
      isFullyIslamic
    );
    // The City Bank additionally runs a distinct long-tenure insurance-linked DPS
    if (name === "The City Bank") {
      await ensureProductShell(inst.id, "DPS", "Insurance-Backed DPS", 60, 240);
    }

    // Islamic banking window/branch products, for banks confirmed (via
    // Bangladesh Bank's Quarterly Report on Islamic Banking, Dec 2024, plus
    // each bank's own site) to run one alongside their conventional business.
    // Dutch-Bangla Bank, BRAC Bank, and Uttara Bank confirmed to have none.
    // Janata Bank has regulatory approval but had not launched as of the most
    // recent official data -- add once it actually goes live.
    const islamicBrand = ISLAMIC_BANKING_BRANDS[name];
    if (islamicBrand) {
      await ensureProductShell(inst.id, "FDR", `${islamicBrand} Mudaraba FDR`, 3, 36, true);
      await ensureProductShell(inst.id, "DPS", `${islamicBrand} Mudaraba DPS`, 12, 120, true);
    }
  }

  // --- Government instruments (structure only, no rates) ----------------------
  const govt = await prisma.institution.upsert({
    where: { id: "govt-bangladesh-bank" },
    update: {},
    create: {
      id: "govt-bangladesh-bank",
      name: "Bangladesh Bank / National Savings Directorate",
      type: "GOVERNMENT",
      website: "https://www.bb.org.bd",
    },
  });
  await ensureProductShell(govt.id, "SANCHAYPATRO", "5-Year Bangladesh Sanchayapatra", 60, 60);
  await ensureProductShell(govt.id, "SANCHAYPATRO", "Pensioner Sanchayapatra", 60, 60);
  await ensureProductShell(govt.id, "SANCHAYPATRO", "Poribar Sanchayapatra (Family)", 60, 60);
  await ensureProductShell(govt.id, "SANCHAYPATRO", "3 Monthly Profit Bearing Sanchayapatra", 36, 36);
  await ensureProductShell(govt.id, "TBOND", "Bangladesh Government Treasury Bond", 24, 240);
  await ensureProductShell(govt.id, "TBILL", "Bangladesh Government Treasury Bill", 1, 12);

  // --- Investment organizations (structure only, no rates) --------------------
  for (const name of INVESTMENT_ORGS) {
    const inst = await prisma.institution.upsert({
      where: { id: `inv-${slug(name)}` },
      update: {},
      create: { id: `inv-${slug(name)}`, name, type: "INVESTMENT_ORG" },
    });
    await ensureProductShell(inst.id, "FDR", "Term Deposit", 3, 36);
    await ensureProductShell(inst.id, "DPS", "Monthly Savings Scheme", 12, 60);
  }

  // --- Digital banks (structure only, no rates) --------------------------------
  const DIGITAL_BANK_WEBSITES: Record<string, string> = {
    "Prime NOW": "https://primenow.ai",
  };
  for (const name of DIGITAL_BANKS) {
    const inst = await prisma.institution.upsert({
      where: { id: `digital-${slug(name)}` },
      update: {},
      create: { id: `digital-${slug(name)}`, name, type: "DIGITAL_BANK", website: DIGITAL_BANK_WEBSITES[name] },
    });
    await ensureProductShell(inst.id, "FDR", "Now FD", 1, 36);
    await ensureProductShell(inst.id, "DPS", "Now Fixed DPS", 6, 120);
  }

  console.log(
    `Seeded ${BANKS.length} banks, 1 government institution, ${INVESTMENT_ORGS.length} investment orgs, ${DIGITAL_BANKS.length} digital banks.`
  );
}

async function ensureProductShell(
  institutionId: string,
  productType: "FDR" | "DPS" | "SANCHAYPATRO" | "TBOND" | "TBILL" | "OTHER",
  name: string,
  minTenureMonths: number,
  maxTenureMonths: number,
  isIslamic = false
) {
  const id = `${institutionId}-${slug(name)}`;
  return prisma.rateProduct.upsert({
    where: { id },
    update: {},
    create: {
      id,
      institutionId,
      productType,
      name,
      compounding: "QUARTERLY",
      minTenureMonths,
      maxTenureMonths,
      isIslamic,
    },
  });
}

// Kept as a local copy (not imported from src/lib/slug.ts) so this script's
// module resolution doesn't depend on the app's tsconfig path aliases — must
// stay logically identical to slugify() in src/lib/slug.ts.
function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
