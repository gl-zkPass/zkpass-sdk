/*
  Warnings:

  - You are about to drop the `credential` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `credential`;

-- CreateTable
CREATE TABLE `dvr` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `query` LONGTEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
