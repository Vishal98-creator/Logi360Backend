/*
  Warnings:

  - The primary key for the `Order` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `consignerName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `destination` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `gstinNumber` on the `Order` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Order" DROP CONSTRAINT "Order_pkey",
DROP COLUMN "consignerName",
DROP COLUMN "destination",
DROP COLUMN "gstinNumber",
ADD COLUMN     "consignmentId" INTEGER,
ADD COLUMN     "consignorGstin" TEXT,
ADD COLUMN     "consignorMobile" TEXT,
ADD COLUMN     "customerId" INTEGER,
ADD COLUMN     "eWayBillExp" TIMESTAMP(3),
ADD COLUMN     "eWayBillNo" TEXT,
ADD COLUMN     "eWayID" TEXT,
ADD COLUMN     "fromAddress" TEXT,
ADD COLUMN     "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "statusId" INTEGER,
ADD COLUMN     "truckId" INTEGER,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "invoiceKey" DROP NOT NULL,
ALTER COLUMN "invoiceFileName" DROP NOT NULL,
ADD CONSTRAINT "Order_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Order_id_seq";
