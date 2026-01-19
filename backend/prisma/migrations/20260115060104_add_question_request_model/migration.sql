-- CreateTable
CREATE TABLE `QuestionRequest` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `teamId` VARCHAR(191) NOT NULL,
    `requesterId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `QuestionRequest_questionId_idx`(`questionId`),
    INDEX `QuestionRequest_teamId_idx`(`teamId`),
    INDEX `QuestionRequest_requesterId_idx`(`requesterId`),
    INDEX `QuestionRequest_status_idx`(`status`),
    UNIQUE INDEX `QuestionRequest_questionId_teamId_requesterId_key`(`questionId`, `teamId`, `requesterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `QuestionRequest` ADD CONSTRAINT `QuestionRequest_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
