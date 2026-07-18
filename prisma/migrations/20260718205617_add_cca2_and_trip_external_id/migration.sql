-- AlterTable
ALTER TABLE "Country" ADD COLUMN     "cca2" TEXT;

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "externalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Country_cca2_key" ON "Country"("cca2");

-- CreateIndex
CREATE UNIQUE INDEX "Trip_externalId_key" ON "Trip"("externalId");

