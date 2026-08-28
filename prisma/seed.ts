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
  "Standard Chartered Bangladesh",
  "Pubali Bank",
  "Uttara Bank",
  "NCC Bank",
  "Bank Asia",
  "Trust Bank",
  "Southeast Bank",
  "IFIC Bank",
];

const INVESTMENT_ORGS = ["IPDC Finance Limited", "Shanta Asset Management", "LankaBangla Finance", "IDLC Finance"];

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
    await ensureProductShell(inst.id, "FDR", "Fixed Deposit Receipt", 3, 36);
    await ensureProductShell(inst.id, "DPS", "Deposit Pension Scheme", 12, 120);
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

  // --- One clearly-labeled demo institution with sample numbers ---------------
  // This is the ONLY place with actual interest-rate numbers in the seed data, and
  // it is unmistakably fake so it can never be confused with a real bank's rate.
  // Delete or deactivate it from the admin panel before going live.
  const demo = await prisma.institution.upsert({
    where: { id: "demo-sample-bank" },
    update: {},
    create: {
      id: "demo-sample-bank",
      name: "Demo Bank (Sample Data — Replace Me)",
      type: "BANK",
    },
  });
  const demoFdr = await ensureProductShell(demo.id, "FDR", "Sample FDR", 3, 36);
  await prisma.rateTier.deleteMany({ where: { productId: demoFdr.id } });
  await prisma.rateTier.createMany({
    data: [
      { productId: demoFdr.id, tenureMonths: 3, minAmount: 0, interestRatePct: 6.5, source: "MANUAL" },
      { productId: demoFdr.id, tenureMonths: 6, minAmount: 0, interestRatePct: 7.0, source: "MANUAL" },
      { productId: demoFdr.id, tenureMonths: 12, minAmount: 0, interestRatePct: 7.75, source: "MANUAL" },
      { productId: demoFdr.id, tenureMonths: 36, minAmount: 0, interestRatePct: 8.25, source: "MANUAL" },
    ],
  });
  const demoDps = await ensureProductShell(demo.id, "DPS", "Sample DPS", 12, 60);
  await prisma.rateTier.deleteMany({ where: { productId: demoDps.id } });
  await prisma.rateTier.createMany({
    data: [
      { productId: demoDps.id, tenureMonths: 12, minAmount: 0, interestRatePct: 6.0, source: "MANUAL" },
      { productId: demoDps.id, tenureMonths: 36, minAmount: 0, interestRatePct: 7.0, source: "MANUAL" },
      { productId: demoDps.id, tenureMonths: 60, minAmount: 0, interestRatePct: 7.5, source: "MANUAL" },
    ],
  });

  console.log(`Seeded ${BANKS.length} banks, 1 government institution, ${INVESTMENT_ORGS.length} investment orgs, and 1 demo institution.`);
}

async function ensureProductShell(
  institutionId: string,
  productType: "FDR" | "DPS" | "SANCHAYPATRO" | "TBOND" | "TBILL" | "OTHER",
  name: string,
  minTenureMonths: number,
  maxTenureMonths: number
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
    },
  });
}

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
