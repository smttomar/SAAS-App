-- AlterTable
ALTER TABLE "Video" ALTER COLUMN "originalSize" DROP NOT NULL,
ALTER COLUMN "compressedSize" DROP NOT NULL;
