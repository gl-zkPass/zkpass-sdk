-- CreateTable
CREATE TABLE `credential` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_did` VARCHAR(191) NOT NULL,
    `credential_id` VARCHAR(191) NOT NULL,
    `credential_type` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `is_revoked` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
