-- CreateEnum
CREATE TYPE "TransportMode" AS ENUM ('PLANE', 'CAR', 'TRAIN', 'BUS', 'FERRY', 'OTHER');

-- AlterTable
ALTER TABLE "Country" ADD COLUMN     "currencies" TEXT[],
ADD COLUMN     "languages" TEXT[];

-- AlterTable
ALTER TABLE "Visit" ADD COLUMN     "transportModes" "TransportMode"[],
ADD COLUMN     "tripId" TEXT;

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitPhoto" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "homeCountryId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisitPhoto_visitId_idx" ON "VisitPhoto"("visitId");

-- CreateIndex
CREATE INDEX "Visit_tripId_idx" ON "Visit"("tripId");

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitPhoto" ADD CONSTRAINT "VisitPhoto_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_homeCountryId_fkey" FOREIGN KEY ("homeCountryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

