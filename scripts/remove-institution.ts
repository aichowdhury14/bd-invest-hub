// Permanently deletes an institution (and, via cascade, its products/rate tiers)
// by exact name. Usage: tsx scripts/remove-institution.ts "Institution Name"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const name = process.argv[2];
  if (!name) {
    console.error('Usage: tsx scripts/remove-institution.ts "Institution Name"');
    process.exitCode = 1;
    return;
  }
  const institution = await prisma.institution.findFirst({ where: { name } });
  if (!institution) {
    console.log(`No institution found named "${name}" — nothing to do.`);
    return;
  }
  await prisma.institution.delete({ where: { id: institution.id } });
  console.log(`Deleted "${name}" (id: ${institution.id}).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
