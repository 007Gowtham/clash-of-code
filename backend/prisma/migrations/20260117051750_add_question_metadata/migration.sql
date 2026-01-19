/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Question` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Question` ADD COLUMN `functionName` VARCHAR(191) NULL,
    ADD COLUMN `functionSignature` TEXT NULL,
    ADD COLUMN `inputType` TEXT NULL,
    ADD COLUMN `outputType` TEXT NULL,
    ADD COLUMN `slug` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Question_slug_key` ON `Question`(`slug`);

-- CreateIndex
CREATE INDEX `Question_slug_idx` ON `Question`(`slug`);
