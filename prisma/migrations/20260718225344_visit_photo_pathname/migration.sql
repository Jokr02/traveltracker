-- AlterTable
ALTER TABLE "VisitPhoto" DROP COLUMN "url",
ADD COLUMN     "pathname" TEXT NOT NULL;

