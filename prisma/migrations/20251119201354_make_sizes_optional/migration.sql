/*
  Warnings:

  - Made the column `originalSize` on table `Video` required. This step will fail if there are existing NULL values in that column.
  - Made the column `compressedSize` on table `Video` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Video" ALTER COLUMN "originalSize" SET NOT NULL,
ALTER COLUMN "compressedSize" SET NOT NULL;
