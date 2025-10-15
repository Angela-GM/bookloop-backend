/*
  Warnings:

  - Added the required column `location` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Book" ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 10;

-- CreateTable
CREATE TABLE "public"."Transaction" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdminAction" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Invite" (
    "id" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "inviteeId" TEXT,
    "code" TEXT NOT NULL,
    "redeemed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invite_code_key" ON "public"."Invite"("code");

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdminAction" ADD CONSTRAINT "AdminAction_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invite" ADD CONSTRAINT "Invite_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
