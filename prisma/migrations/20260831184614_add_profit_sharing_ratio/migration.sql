-- CreateTable
CREATE TABLE "ProfitSharingRatio" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "tenureMonths" INTEGER NOT NULL,
    "customerRatio" INTEGER NOT NULL,
    "bankRatio" INTEGER NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfitSharingRatio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfitSharingRatio_productId_idx" ON "ProfitSharingRatio"("productId");

-- AddForeignKey
ALTER TABLE "ProfitSharingRatio" ADD CONSTRAINT "ProfitSharingRatio_productId_fkey" FOREIGN KEY ("productId") REFERENCES "RateProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
