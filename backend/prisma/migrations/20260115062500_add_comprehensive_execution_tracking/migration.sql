/*
  Warnings:

  - You are about to drop the column `output` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Submission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Submission` DROP COLUMN `output`,
    DROP COLUMN `status`,
    ADD COLUMN `compileOutput` TEXT NULL,
    ADD COLUMN `completedAt` DATETIME(3) NULL,
    ADD COLUMN `mode` ENUM('RUN', 'SUBMIT') NOT NULL DEFAULT 'SUBMIT',
    ADD COLUMN `verdict` ENUM('PENDING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR', 'PRESENTATION_ERROR', 'INTERNAL_ERROR') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `TestCase` ADD COLUMN `category` ENUM('BASIC', 'EDGE', 'LARGE', 'SPECIAL', 'CORNER', 'INVALID', 'HIDDEN') NULL DEFAULT 'BASIC',
    ADD COLUMN `memoryLimit` INTEGER NULL DEFAULT 256,
    ADD COLUMN `order` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `points` INTEGER NOT NULL DEFAULT 5,
    ADD COLUMN `timeLimit` INTEGER NULL DEFAULT 2000;

-- CreateTable
CREATE TABLE `TestCaseResult` (
    `id` VARCHAR(191) NOT NULL,
    `submissionId` VARCHAR(191) NOT NULL,
    `testCaseId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `executionTime` DOUBLE NULL,
    `memory` DOUBLE NULL,
    `output` TEXT NULL,
    `error` TEXT NULL,
    `judge0Token` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TestCaseResult_submissionId_idx`(`submissionId`),
    INDEX `TestCaseResult_testCaseId_idx`(`testCaseId`),
    INDEX `TestCaseResult_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Submission_verdict_idx` ON `Submission`(`verdict`);

-- CreateIndex
CREATE INDEX `Submission_userId_questionId_idx` ON `Submission`(`userId`, `questionId`);

-- CreateIndex
CREATE INDEX `TestCase_isSample_idx` ON `TestCase`(`isSample`);

-- CreateIndex
CREATE INDEX `TestCase_isHidden_idx` ON `TestCase`(`isHidden`);

-- AddForeignKey
ALTER TABLE `TestCaseResult` ADD CONSTRAINT `TestCaseResult_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `Submission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestCaseResult` ADD CONSTRAINT `TestCaseResult_testCaseId_fkey` FOREIGN KEY (`testCaseId`) REFERENCES `TestCase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
