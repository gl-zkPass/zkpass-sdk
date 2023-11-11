/*
  Warnings:

  - The primary key for the `verification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `verification` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `verification` table. All the data in the column will be lost.
  - You are about to drop the column `jwz` on the `verification` table. All the data in the column will be lost.
  - You are about to drop the column `request` on the `verification` table. All the data in the column will be lost.
  - You are about to drop the column `requestedAt` on the `verification` table. All the data in the column will be lost.
  - Added the required column `dvr_id` to the `verification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `query_id` to the `verification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requested_at` to the `verification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `verification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wallet` to the `verification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `verification` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    DROP COLUMN `isVerified`,
    DROP COLUMN `jwz`,
    DROP COLUMN `request`,
    DROP COLUMN `requestedAt`,
    ADD COLUMN `dvr_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `query_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `requested_at` INTEGER NOT NULL,
    ADD COLUMN `status` BOOLEAN NOT NULL,
    ADD COLUMN `wallet` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`dvr_id`);
