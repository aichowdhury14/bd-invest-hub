"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

function revalidateAdminAndPublic() {
  revalidatePath("/admin/institutions");
  revalidatePath("/");
  revalidatePath("/calculator");
  revalidatePath("/compare");
}

// ---------- Institutions ----------

const institutionSchema = z.object({
  name: z.string().trim().min(2),
  type: z.enum(["BANK", "GOVERNMENT", "INVESTMENT_ORG"]),
  website: z.string().trim().url().optional().or(z.literal("")),
});

export async function createInstitution(formData: FormData) {
  await requireAdmin();
  const parsed = institutionSchema.parse({
    name: formData.get("name"),
    type: formData.get("type"),
    website: formData.get("website") ?? "",
  });
  await prisma.institution.create({
    data: { ...parsed, website: parsed.website || null },
  });
  revalidateAdminAndPublic();
}

export async function updateInstitution(id: string, formData: FormData) {
  await requireAdmin();
  const parsed = institutionSchema.parse({
    name: formData.get("name"),
    type: formData.get("type"),
    website: formData.get("website") ?? "",
  });
  await prisma.institution.update({
    where: { id },
    data: { ...parsed, website: parsed.website || null },
  });
  revalidatePath(`/admin/institutions/${id}`);
  revalidateAdminAndPublic();
}

export async function toggleInstitutionActive(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.institution.update({ where: { id }, data: { isActive } });
  revalidateAdminAndPublic();
}

export async function deleteInstitution(id: string) {
  await requireAdmin();
  await prisma.institution.delete({ where: { id } });
  revalidateAdminAndPublic();
}

// ---------- Products ----------

const productSchema = z.object({
  productType: z.enum(["FDR", "DPS", "SANCHAYPATRO", "TBOND", "TBILL", "OTHER"]),
  name: z.string().trim().min(2),
  compounding: z.enum(["SIMPLE", "MONTHLY", "QUARTERLY", "YEARLY"]),
  minTenureMonths: z.coerce.number().int().positive(),
  maxTenureMonths: z.coerce.number().int().positive(),
});

export async function createProduct(institutionId: string, formData: FormData) {
  await requireAdmin();
  const parsed = productSchema.parse({
    productType: formData.get("productType"),
    name: formData.get("name"),
    compounding: formData.get("compounding"),
    minTenureMonths: formData.get("minTenureMonths"),
    maxTenureMonths: formData.get("maxTenureMonths"),
  });
  await prisma.rateProduct.create({ data: { institutionId, ...parsed } });
  revalidatePath(`/admin/institutions/${institutionId}`);
  revalidateAdminAndPublic();
}

export async function toggleProductActive(id: string, institutionId: string, isActive: boolean) {
  await requireAdmin();
  await prisma.rateProduct.update({ where: { id }, data: { isActive } });
  revalidatePath(`/admin/institutions/${institutionId}`);
  revalidateAdminAndPublic();
}

export async function deleteProduct(id: string, institutionId: string) {
  await requireAdmin();
  await prisma.rateProduct.delete({ where: { id } });
  revalidatePath(`/admin/institutions/${institutionId}`);
  revalidateAdminAndPublic();
}

// ---------- Rate tiers ----------

const rateTierSchema = z.object({
  tenureMonths: z.coerce.number().int().positive(),
  minAmount: z.coerce.number().nonnegative(),
  maxAmount: z.coerce.number().positive().optional(),
  interestRatePct: z.coerce.number().nonnegative().max(100),
  sourceUrl: z.string().trim().url().optional().or(z.literal("")),
});

export async function createRateTier(productId: string, institutionId: string, formData: FormData) {
  await requireAdmin();
  const parsed = rateTierSchema.parse({
    tenureMonths: formData.get("tenureMonths"),
    minAmount: formData.get("minAmount"),
    maxAmount: formData.get("maxAmount") || undefined,
    interestRatePct: formData.get("interestRatePct"),
    sourceUrl: formData.get("sourceUrl") ?? "",
  });
  await prisma.rateTier.create({
    data: {
      productId,
      tenureMonths: parsed.tenureMonths,
      minAmount: parsed.minAmount,
      maxAmount: parsed.maxAmount ?? null,
      interestRatePct: parsed.interestRatePct,
      source: "MANUAL",
      sourceUrl: parsed.sourceUrl || null,
    },
  });
  revalidatePath(`/admin/institutions/${institutionId}`);
  revalidateAdminAndPublic();
}

export async function deleteRateTier(id: string, institutionId: string) {
  await requireAdmin();
  await prisma.rateTier.delete({ where: { id } });
  revalidatePath(`/admin/institutions/${institutionId}`);
  revalidateAdminAndPublic();
}

// ---------- Rate drift review ----------

export async function approveDriftFlag(id: string) {
  await requireAdmin();
  const flag = await prisma.rateDriftFlag.findUniqueOrThrow({ where: { id } });

  const existing = await prisma.rateTier.findFirst({
    where: { productId: flag.productId, tenureMonths: flag.tenureMonths },
    orderBy: { updatedAt: "desc" },
  });

  await prisma.$transaction([
    existing
      ? prisma.rateTier.update({
          where: { id: existing.id },
          data: {
            interestRatePct: flag.proposedRatePct,
            source: "SCRAPED",
            sourceUrl: flag.sourceUrl,
            scrapedAt: new Date(),
          },
        })
      : prisma.rateTier.create({
          data: {
            productId: flag.productId,
            tenureMonths: flag.tenureMonths,
            minAmount: 0,
            interestRatePct: flag.proposedRatePct,
            source: "SCRAPED",
            sourceUrl: flag.sourceUrl,
            scrapedAt: new Date(),
          },
        }),
    prisma.rateDriftFlag.update({
      where: { id },
      data: { status: "APPROVED", resolvedAt: new Date() },
    }),
  ]);

  revalidatePath("/admin/rate-drift");
  revalidateAdminAndPublic();
}

export async function rejectDriftFlag(id: string) {
  await requireAdmin();
  await prisma.rateDriftFlag.update({
    where: { id },
    data: { status: "REJECTED", resolvedAt: new Date() },
  });
  revalidatePath("/admin/rate-drift");
}
