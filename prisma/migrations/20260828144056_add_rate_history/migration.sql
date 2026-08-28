-- CreateTable
CREATE TABLE "RateHistory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "tenureMonths" INTEGER NOT NULL,
    "minAmount" DECIMAL(18,2) NOT NULL,
    "maxAmount" DECIMAL(18,2),
    "interestRatePct" DECIMAL(6,3) NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RateHistory_productId_tenureMonths_idx" ON "RateHistory"("productId", "tenureMonths");

-- CreateIndex
CREATE INDEX "RateHistory_recordedAt_idx" ON "RateHistory"("recordedAt");

-- AddForeignKey
ALTER TABLE "RateHistory" ADD CONSTRAINT "RateHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "RateProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
