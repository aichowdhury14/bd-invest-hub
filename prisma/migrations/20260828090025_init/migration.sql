-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('BANK', 'GOVERNMENT', 'INVESTMENT_ORG');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('FDR', 'DPS', 'SANCHAYPATRO', 'TBOND', 'TBILL', 'OTHER');

-- CreateEnum
CREATE TYPE "Compounding" AS ENUM ('SIMPLE', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "RateSource" AS ENUM ('MANUAL', 'SCRAPED');

-- CreateEnum
CREATE TYPE "ScrapeStatus" AS ENUM ('SUCCESS', 'FAILURE', 'PARTIAL');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'EDITOR');

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InstitutionType" NOT NULL,
    "logoUrl" TEXT,
    "website" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateProduct" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "productType" "ProductType" NOT NULL,
    "name" TEXT NOT NULL,
    "compounding" "Compounding" NOT NULL DEFAULT 'QUARTERLY',
    "minTenureMonths" INTEGER NOT NULL,
    "maxTenureMonths" INTEGER NOT NULL,
    "minAmount" DECIMAL(18,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateTier" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "tenureMonths" INTEGER NOT NULL,
    "minAmount" DECIMAL(18,2) NOT NULL,
    "maxAmount" DECIMAL(18,2),
    "interestRatePct" DECIMAL(6,3) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "RateSource" NOT NULL DEFAULT 'MANUAL',
    "sourceUrl" TEXT,
    "scrapedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapeLog" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "status" "ScrapeStatus" NOT NULL,
    "message" TEXT,
    "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScrapeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalculatorEvent" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "productType" "ProductType",
    "amount" DECIMAL(18,2) NOT NULL,
    "tenureMonths" INTEGER NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalculatorEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageViewEvent" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageViewEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Institution_type_idx" ON "Institution"("type");

-- CreateIndex
CREATE INDEX "RateProduct_institutionId_idx" ON "RateProduct"("institutionId");

-- CreateIndex
CREATE INDEX "RateProduct_productType_idx" ON "RateProduct"("productType");

-- CreateIndex
CREATE INDEX "RateTier_productId_idx" ON "RateTier"("productId");

-- CreateIndex
CREATE INDEX "RateTier_tenureMonths_idx" ON "RateTier"("tenureMonths");

-- CreateIndex
CREATE INDEX "ScrapeLog_institutionId_idx" ON "ScrapeLog"("institutionId");

-- CreateIndex
CREATE INDEX "ScrapeLog_runAt_idx" ON "ScrapeLog"("runAt");

-- CreateIndex
CREATE INDEX "CalculatorEvent_createdAt_idx" ON "CalculatorEvent"("createdAt");

-- CreateIndex
CREATE INDEX "CalculatorEvent_sessionId_idx" ON "CalculatorEvent"("sessionId");

-- CreateIndex
CREATE INDEX "PageViewEvent_createdAt_idx" ON "PageViewEvent"("createdAt");

-- CreateIndex
CREATE INDEX "PageViewEvent_path_idx" ON "PageViewEvent"("path");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "RateProduct" ADD CONSTRAINT "RateProduct_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RateTier" ADD CONSTRAINT "RateTier_productId_fkey" FOREIGN KEY ("productId") REFERENCES "RateProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScrapeLog" ADD CONSTRAINT "ScrapeLog_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalculatorEvent" ADD CONSTRAINT "CalculatorEvent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "RateProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
