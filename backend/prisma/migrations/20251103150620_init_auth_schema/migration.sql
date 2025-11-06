-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN_ROOM', 'TEAM_LEADER', 'TEAM_MEMBER');

-- CreateEnum
CREATE TYPE "LoginType" AS ENUM ('GOOGLE', 'GITHUB', 'EMAIL_PASSWORD');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "password" TEXT,
    "loginType" "LoginType" NOT NULL DEFAULT 'EMAIL_PASSWORD',
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "refreshToken" TEXT,
    "forgetPasswordToken" TEXT,
    "forgetPasswordExpiry" TIMESTAMP(3),
    "emailVerificationToken" TEXT,
    "emailVerificationExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
