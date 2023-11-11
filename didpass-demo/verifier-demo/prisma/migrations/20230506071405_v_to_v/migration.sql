/*
  Warnings:

  - You are about to drop the `Verification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Verification`;

-- CreateTable
CREATE TABLE `verification` (
    `id` VARCHAR(191) NOT NULL,
    `request` JSON NOT NULL,
    `requestedAt` INTEGER NOT NULL,
    `jwz` VARCHAR(6000) NOT NULL,
    `isVerified` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
