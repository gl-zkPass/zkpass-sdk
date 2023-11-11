/*
  Warnings:

  - The primary key for the `dvr` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `dvr` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `dvr` table. All the data in the column will be lost.
  - Added the required column `dvr_id` to the `dvr` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dvr_title` to the `dvr` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `dvr` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    DROP COLUMN `title`,
    ADD COLUMN `dvr_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `dvr_title` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`dvr_id`);
