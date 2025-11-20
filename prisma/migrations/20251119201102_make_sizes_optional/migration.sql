/*
  Warnings:

  - The `originalSize` column on the `Video` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `compressedSize` column on the `Video` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "originalSize",
ADD COLUMN     "originalSize" INTEGER,
DROP COLUMN "compressedSize",
ADD COLUMN     "compressedSize" INTEGER;
