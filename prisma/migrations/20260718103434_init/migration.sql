-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PlanningStatus" AS ENUM ('NONE', 'WISHLIST', 'PLANNED');

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "cca3" TEXT NOT NULL,
    "ccn3" TEXT,
    "name" TEXT NOT NULL,
    "continent" TEXT NOT NULL,
    "subregion" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "areaKm2" DOUBLE PRECISION,
    "flagEmoji" TEXT,
    "borders" TEXT[],
    "planningStatus" "PlanningStatus" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "rating" INTEGER,
    "coverImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_cca3_key" ON "Country"("cca3");

-- CreateIndex
CREATE INDEX "Country_continent_idx" ON "Country"("continent");

-- CreateIndex
CREATE INDEX "Visit_countryId_idx" ON "Visit"("countryId");

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

