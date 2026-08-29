"use server";

import { prisma } from "@/lib/prisma";
import type { ProductType } from "@prisma/client";

export async function trackPageView(path: string, sessionId: string, referrer?: string) {
  try {
    await prisma.pageViewEvent.create({
      data: { path, sessionId, referrer: referrer || null },
    });
  } catch {
    // Analytics must never break the user-facing experience.
  }
}

export async function trackCalculatorUse(input: {
  sessionId: string;
  productId?: string;
  productType?: ProductType;
  amount: number;
  tenureMonths: number;
}) {
  try {
    await prisma.calculatorEvent.create({
      data: {
        sessionId: input.sessionId,
        productId: input.productId,
        productType: input.productType,
        amount: input.amount,
        tenureMonths: input.tenureMonths,
      },
    });
  } catch {
    // Analytics must never break the user-facing experience.
  }
}

export async function trackCompareView(productId: string, sessionId: string) {
  try {
    await prisma.compareEvent.create({
      data: { productId, sessionId },
    });
  } catch {
    // Analytics must never break the user-facing experience.
  }
}
