/*
  Warnings:

  - You are about to drop the column `query_id` on the `verification` table. All the data in the column will be lost.
  - You are about to drop the column `requested_at` on the `verification` table. All the data in the column will be lost.
  - Added the required column `dvr_id` to the `verification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dvr_title` to the `verification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_stamp` to the `verification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `verification` DROP COLUMN `query_id`,
    DROP COLUMN `requested_at`,
    ADD COLUMN `dvr_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `dvr_title` VARCHAR(191) NOT NULL,
    ADD COLUMN `time_stamp` INTEGER NOT NULL;
