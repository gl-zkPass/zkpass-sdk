/*
  Warnings:

  - Added the required column `secretKey` to the `ApiKey` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ApiKey` ADD COLUMN `secretKey` VARCHAR(191) NOT NULL;
