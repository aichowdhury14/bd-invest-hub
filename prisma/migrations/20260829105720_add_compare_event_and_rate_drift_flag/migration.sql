-- CreateEnum
CREATE TYPE "DriftStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "CompareEvent" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompareEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateDriftFlag" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "tenureMonths" INTEGER NOT NULL,
    "currentRatePct" DECIMAL(6,3),
    "proposedRatePct" DECIMAL(6,3) NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "status" "DriftStatus" NOT NULL DEFAULT 'PENDING',
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "RateDriftFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompareEvent_createdAt_idx" ON "CompareEvent"("createdAt");

-- CreateIndex
CREATE INDEX "CompareEvent_productId_idx" ON "CompareEvent"("productId");

-- CreateIndex
CREATE INDEX "RateDriftFlag_status_idx" ON "RateDriftFlag"("status");

-- CreateIndex
CREATE INDEX "RateDriftFlag_productId_idx" ON "RateDriftFlag"("productId");

-- AddForeignKey
ALTER TABLE "CompareEvent" ADD CONSTRAINT "CompareEvent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "RateProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RateDriftFlag" ADD CONSTRAINT "RateDriftFlag_productId_fkey" FOREIGN KEY ("productId") REFERENCES "RateProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
