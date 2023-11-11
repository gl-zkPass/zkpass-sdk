-- CreateTable
CREATE TABLE `verification` (
    `id` VARCHAR(191) NOT NULL,
    `request` JSON NOT NULL,
    `requestedAt` INTEGER NOT NULL,
    `jwz` VARCHAR(191) NOT NULL,
    `isVerified` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
