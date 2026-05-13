-- Baseline schema for Supabase Postgres (generated from prisma/schema.prisma).

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('GOV', 'NEWS', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('KG', 'PC');

-- CreateTable
CREATE TABLE "Market" (
    "id" TEXT NOT NULL,
    "canonicalKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cityMunicipality" TEXT NOT NULL,
    "address" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Market_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" TEXT NOT NULL,
    "canonicalKey" TEXT NOT NULL,
    "tagalogName" TEXT NOT NULL,
    "englishName" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "tagalogName" TEXT NOT NULL,
    "canonicalKey" TEXT NOT NULL,
    "typicalUnit" "Unit" NOT NULL,
    "imageUrl" TEXT,
    "attributes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "canonicalKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SourceType" NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "url" TEXT,
    "citationText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceObservation" (
    "id" TEXT NOT NULL,
    "marketId" TEXT,
    "productId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "variantLabel" TEXT,
    "priceValue" DECIMAL(10,2) NOT NULL,
    "unit" "Unit" NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "confidence" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceObservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyAggregate" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "areaType" TEXT NOT NULL,
    "areaKey" TEXT NOT NULL,
    "monthStart" TIMESTAMP(3) NOT NULL,
    "minPrice" DECIMAL(10,2) NOT NULL,
    "maxPrice" DECIMAL(10,2) NOT NULL,
    "observationCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Market_canonicalKey_key" ON "Market"("canonicalKey");

-- CreateIndex
CREATE INDEX "Market_cityMunicipality_idx" ON "Market"("cityMunicipality");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_canonicalKey_key" ON "ProductCategory"("canonicalKey");

-- CreateIndex
CREATE INDEX "ProductCategory_sortOrder_idx" ON "ProductCategory"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_tagalogName_key" ON "ProductCategory"("tagalogName");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_tagalogName_idx" ON "Product"("tagalogName");

-- CreateIndex
CREATE UNIQUE INDEX "Product_canonicalKey_key" ON "Product"("canonicalKey");

-- CreateIndex
CREATE UNIQUE INDEX "Source_canonicalKey_key" ON "Source"("canonicalKey");

-- CreateIndex
CREATE INDEX "Source_type_idx" ON "Source"("type");

-- CreateIndex
CREATE INDEX "Source_publishedAt_idx" ON "Source"("publishedAt");

-- CreateIndex
CREATE INDEX "PriceObservation_productId_observedAt_idx" ON "PriceObservation"("productId", "observedAt");

-- CreateIndex
CREATE INDEX "PriceObservation_marketId_observedAt_idx" ON "PriceObservation"("marketId", "observedAt");

-- CreateIndex
CREATE INDEX "PriceObservation_sourceId_idx" ON "PriceObservation"("sourceId");

-- CreateIndex
CREATE INDEX "MonthlyAggregate_areaType_areaKey_monthStart_idx" ON "MonthlyAggregate"("areaType", "areaKey", "monthStart");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyAggregate_productId_areaType_areaKey_monthStart_key" ON "MonthlyAggregate"("productId", "areaType", "areaKey", "monthStart");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceObservation" ADD CONSTRAINT "PriceObservation_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceObservation" ADD CONSTRAINT "PriceObservation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceObservation" ADD CONSTRAINT "PriceObservation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyAggregate" ADD CONSTRAINT "MonthlyAggregate_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
