-- DropForeignKey
ALTER TABLE `ApiKey` DROP FOREIGN KEY `ApiKey_userId_fkey`;

-- CreateTable
CREATE TABLE `UserApi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastModifiedAt` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `lastModifiedBy` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `UserApi_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ApiKey` ADD CONSTRAINT `ApiKey_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `UserApi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
