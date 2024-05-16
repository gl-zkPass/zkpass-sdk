/*
  Warnings:

  - Added the required column `lastModifiedBy` to the `ApiKey` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ApiKey` ADD COLUMN `lastModifiedBy` VARCHAR(191) NOT NULL;
