/*
  Warnings:

  - You are about to drop the column `constraints` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `hint1` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `hint2` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `testCases` on the `Question` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tokenHash]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tokenHash` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `RefreshToken_token_idx` ON `RefreshToken`;

-- DropIndex
DROP INDEX `RefreshToken_token_key` ON `RefreshToken`;

-- AlterTable
ALTER TABLE `Question` DROP COLUMN `constraints`,
    DROP COLUMN `hint1`,
    DROP COLUMN `hint2`,
    DROP COLUMN `testCases`;

-- AlterTable
ALTER TABLE `RefreshToken` ADD COLUMN `deviceInfo` TEXT NULL,
    ADD COLUMN `ipAddress` VARCHAR(191) NULL,
    ADD COLUMN `lastActive` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `tokenHash` VARCHAR(191) NOT NULL,
    MODIFY `token` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Room` ADD COLUMN `listed` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `visibility` ENUM('PUBLIC', 'PRIVATE') NOT NULL DEFAULT 'PUBLIC';

-- AlterTable
ALTER TABLE `User` ADD COLUMN `lastLoginAt` DATETIME(3) NULL,
    ADD COLUMN `lastLoginIp` VARCHAR(191) NULL,
    ADD COLUMN `lockedUntil` DATETIME(3) NULL,
    ADD COLUMN `loginAttempts` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `RoomParticipant` (
    `id` VARCHAR(191) NOT NULL,
    `roomId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `teamId` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'LEFT', 'KICKED') NOT NULL DEFAULT 'ACTIVE',
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `leftAt` DATETIME(3) NULL,

    INDEX `RoomParticipant_roomId_status_idx`(`roomId`, `status`),
    INDEX `RoomParticipant_userId_roomId_idx`(`userId`, `roomId`),
    UNIQUE INDEX `RoomParticipant_roomId_userId_key`(`roomId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoomEvent` (
    `id` VARCHAR(191) NOT NULL,
    `roomId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `data` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RoomEvent_roomId_createdAt_idx`(`roomId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Hint` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,

    INDEX `Hint_questionId_idx`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Constraint` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,

    INDEX `Constraint_questionId_idx`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TestCase` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `input` TEXT NOT NULL,
    `output` TEXT NOT NULL,
    `explanation` TEXT NULL,
    `isHidden` BOOLEAN NOT NULL DEFAULT false,
    `isSample` BOOLEAN NOT NULL DEFAULT false,

    INDEX `TestCase_questionId_idx`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `RefreshToken_tokenHash_key` ON `RefreshToken`(`tokenHash`);

-- CreateIndex
CREATE INDEX `RefreshToken_tokenHash_idx` ON `RefreshToken`(`tokenHash`);

-- CreateIndex
CREATE INDEX `Room_visibility_status_idx` ON `Room`(`visibility`, `status`);

-- CreateIndex
CREATE INDEX `Room_status_listed_idx` ON `Room`(`status`, `listed`);

-- CreateIndex
CREATE INDEX `Team_roomId_visibility_idx` ON `Team`(`roomId`, `visibility`);

-- CreateIndex
CREATE INDEX `Team_code_idx` ON `Team`(`code`);

-- AddForeignKey
ALTER TABLE `RoomParticipant` ADD CONSTRAINT `RoomParticipant_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomParticipant` ADD CONSTRAINT `RoomParticipant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomEvent` ADD CONSTRAINT `RoomEvent_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Hint` ADD CONSTRAINT `Hint_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Constraint` ADD CONSTRAINT `Constraint_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestCase` ADD CONSTRAINT `TestCase_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
