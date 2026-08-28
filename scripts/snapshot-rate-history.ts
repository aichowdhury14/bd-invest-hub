// Records a point-in-time snapshot of every current rate tier into RateHistory.
// Run on a schedule (see .github/workflows/snapshot-history.yml) so that real
// trend/forecasting features have real historical data to work from over time.
// Deliberately does NOT backfill fabricated history for past dates — the first
// run just marks "tracking started here."
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tiers = await prisma.rateTier.findMany({
    select: { productId: true, tenureMonths: true, minAmount: true, maxAmount: true, interestRatePct: true },
  });

  if (tiers.length === 0) {
    console.log("No rate tiers to snapshot.");
    return;
  }

  await prisma.rateHistory.createMany({
    data: tiers.map((t) => ({
      productId: t.productId,
      tenureMonths: t.tenureMonths,
      minAmount: t.minAmount,
      maxAmount: t.maxAmount,
      interestRatePct: t.interestRatePct,
    })),
  });

  console.log(`Snapshotted ${tiers.length} rate tiers to RateHistory.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
