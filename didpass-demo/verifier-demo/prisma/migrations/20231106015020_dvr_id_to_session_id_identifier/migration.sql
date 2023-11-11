/*
  Warnings:

  - The primary key for the `verification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dvr_id` on the `verification` table. All the data in the column will be lost.
  - Added the required column `id` to the `verification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `verification` DROP PRIMARY KEY,
    DROP COLUMN `dvr_id`,
    ADD COLUMN `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);
