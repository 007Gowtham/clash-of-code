-- AlterTable
ALTER TABLE `Question` ADD COLUMN `customTypes` JSON NULL,
    ADD COLUMN `inputFormats` JSON NULL,
    ADD COLUMN `outputFormat` JSON NULL;

-- CreateTable
CREATE TABLE `QuestionTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `language` VARCHAR(191) NOT NULL,
    `headerCode` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `boilerplate` TEXT NULL,
    `diagram` TEXT NULL,
    `mainFunction` TEXT NOT NULL,
    `userFunction` TEXT NOT NULL,
    `definition` TEXT NULL,

    INDEX `QuestionTemplate_questionId_idx`(`questionId`),
    UNIQUE INDEX `QuestionTemplate_questionId_language_key`(`questionId`, `language`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `QuestionTemplate` ADD CONSTRAINT `QuestionTemplate_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
