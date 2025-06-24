/*
  Warnings:

  - The primary key for the `ConsignorConsignee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `doorDeliveryCharge` on the `ConsignorConsignee` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `ConsignorConsignee` table. All the data in the column will be lost.
  - You are about to drop the column `locationID` on the `ConsignorConsignee` table. All the data in the column will be lost.
  - You are about to drop the column `rateAmount` on the `ConsignorConsignee` table. All the data in the column will be lost.
  - The primary key for the `ItemDetails` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `hsnCode` on the `ItemDetails` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `ItemDetails` table. All the data in the column will be lost.
  - You are about to drop the column `locationID` on the `ItemDetails` table. All the data in the column will be lost.
  - You are about to drop the column `typeOfPackaging` on the `ItemDetails` table. All the data in the column will be lost.
  - The primary key for the `Order` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `consignmentId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `consignorGstin` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `consignorMobile` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `consignorName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `eWayBillExp` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `eWayBillNo` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceFileName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceKey` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `orderDate` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `truckId` on the `Order` table. All the data in the column will be lost.
  - The `eWayID` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `ServiceProviderDetails` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ServiceProviderDetails` table. All the data in the column will be lost.
  - The primary key for the `Station` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Station` table. All the data in the column will be lost.
  - The primary key for the `Transporter` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Transporter` table. All the data in the column will be lost.
  - The primary key for the `TruckDetails` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `TruckDetails` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paymentID]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transporterId` to the `ConsignorConsignee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `ConsignorConsignee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `biltyCharge` to the `ItemDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchName` to the `ItemDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerID` to the `ItemDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doorDeliveryCharge` to the `ItemDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hammali` to the `ItemDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationId` to the `ItemDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `per` to the `ItemDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stationName` to the `ItemDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transporterId` to the `ItemDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transporterId` to the `ServiceProviderDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empID` to the `Station` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationId` to the `Station` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transporterId` to the `Station` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transporterId` to the `Transporter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transporterId` to the `TruckDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transporterId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusType" AS ENUM ('Draft', 'Unallocated', 'Allocated', 'Shipped', 'Delivered', 'Cancelled');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('CREDIT', 'DEBIT', 'TRANSFER', 'REFUND');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'PAYPAL', 'CASH');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- DropIndex
DROP INDEX "ConsignorConsignee_gstin_key";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "ConsignorConsignee" DROP CONSTRAINT "ConsignorConsignee_pkey",
DROP COLUMN "doorDeliveryCharge",
DROP COLUMN "id",
DROP COLUMN "locationID",
DROP COLUMN "rateAmount",
ADD COLUMN     "customerId" SERIAL NOT NULL,
ADD COLUMN     "transporterId" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD CONSTRAINT "ConsignorConsignee_pkey" PRIMARY KEY ("customerId");

-- AlterTable
ALTER TABLE "ItemDetails" DROP CONSTRAINT "ItemDetails_pkey",
DROP COLUMN "hsnCode",
DROP COLUMN "id",
DROP COLUMN "locationID",
DROP COLUMN "typeOfPackaging",
ADD COLUMN     "biltyCharge" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "branchName" TEXT NOT NULL,
ADD COLUMN     "customerID" INTEGER NOT NULL,
ADD COLUMN     "doorDeliveryCharge" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "hammali" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "itemId" SERIAL NOT NULL,
ADD COLUMN     "locationId" TEXT NOT NULL,
ADD COLUMN     "per" TEXT NOT NULL,
ADD COLUMN     "stationName" TEXT NOT NULL,
ADD COLUMN     "transporterId" TEXT NOT NULL,
ADD CONSTRAINT "ItemDetails_pkey" PRIMARY KEY ("itemId");

-- AlterTable
ALTER TABLE "Order" DROP CONSTRAINT "Order_pkey",
DROP COLUMN "consignmentId",
DROP COLUMN "consignorGstin",
DROP COLUMN "consignorMobile",
DROP COLUMN "consignorName",
DROP COLUMN "createdAt",
DROP COLUMN "eWayBillExp",
DROP COLUMN "eWayBillNo",
DROP COLUMN "id",
DROP COLUMN "invoiceFileName",
DROP COLUMN "invoiceKey",
DROP COLUMN "orderDate",
DROP COLUMN "truckId",
ADD COLUMN     "assignedTruckId" INTEGER,
ADD COLUMN     "biltyKey" TEXT,
ADD COLUMN     "biltyNumber" TEXT,
ADD COLUMN     "deliveryType" TEXT,
ADD COLUMN     "destination" TEXT,
ADD COLUMN     "orderId" TEXT NOT NULL,
ADD COLUMN     "payMode" TEXT,
ADD COLUMN     "paymentID" INTEGER,
ADD COLUMN     "toAddress" TEXT,
ADD COLUMN     "transporterId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "weight" DOUBLE PRECISION,
DROP COLUMN "eWayID",
ADD COLUMN     "eWayID" INTEGER,
ADD CONSTRAINT "Order_pkey" PRIMARY KEY ("orderId");

-- AlterTable
ALTER TABLE "ServiceProviderDetails" DROP CONSTRAINT "ServiceProviderDetails_pkey",
DROP COLUMN "id",
ADD COLUMN     "serviceProviderId" SERIAL NOT NULL,
ADD COLUMN     "transporterId" TEXT NOT NULL,
ADD CONSTRAINT "ServiceProviderDetails_pkey" PRIMARY KEY ("serviceProviderId");

-- AlterTable
ALTER TABLE "Station" DROP CONSTRAINT "Station_pkey",
DROP COLUMN "id",
ADD COLUMN     "empID" INTEGER NOT NULL,
ADD COLUMN     "locationId" TEXT NOT NULL,
ADD COLUMN     "transporterId" TEXT NOT NULL,
ADD CONSTRAINT "Station_pkey" PRIMARY KEY ("locationId");

-- AlterTable
ALTER TABLE "Transporter" DROP CONSTRAINT "Transporter_pkey",
DROP COLUMN "id",
ADD COLUMN     "transporterId" TEXT NOT NULL,
ADD CONSTRAINT "Transporter_pkey" PRIMARY KEY ("transporterId");

-- AlterTable
ALTER TABLE "TruckDetails" DROP CONSTRAINT "TruckDetails_pkey",
DROP COLUMN "id",
ADD COLUMN     "transporterId" TEXT NOT NULL,
ADD COLUMN     "truckId" SERIAL NOT NULL,
ADD CONSTRAINT "TruckDetails_pkey" PRIMARY KEY ("truckId");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "email",
DROP COLUMN "id",
ADD COLUMN     "empId" SERIAL NOT NULL,
ADD COLUMN     "transporterId" TEXT NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("empId");

-- DropEnum
DROP TYPE "OrderStatus";

-- CreateTable
CREATE TABLE "OrderStatus" (
    "id" SERIAL NOT NULL,
    "status" "StatusType" NOT NULL,

    CONSTRAINT "OrderStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "orderID" TEXT NOT NULL,
    "transactionID" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentType" "PaymentType" NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "referenceNumber" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallanDetails" (
    "challanID" SERIAL NOT NULL,
    "challanNo" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "challanDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalWeight" DOUBLE PRECISION NOT NULL,
    "totalBiltyCount" INTEGER NOT NULL,
    "totalFreight" DOUBLE PRECISION NOT NULL,
    "totalDeliveryCharges" DOUBLE PRECISION NOT NULL,
    "truckId" INTEGER NOT NULL,
    "customerID" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" TEXT,

    CONSTRAINT "ChallanDetails_pkey" PRIMARY KEY ("challanID")
);

-- CreateTable
CREATE TABLE "ChallanOrderMap" (
    "challanId" INTEGER NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "ChallanOrderMap_pkey" PRIMARY KEY ("challanId","orderId")
);

-- CreateTable
CREATE TABLE "EwayBillDetails" (
    "eWayID" SERIAL NOT NULL,
    "ewayBillNumber" TEXT NOT NULL,
    "ewayBillDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ewayBillExpiry" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ewayBillDocPath" TEXT NOT NULL,

    CONSTRAINT "EwayBillDetails_pkey" PRIMARY KEY ("eWayID")
);

-- CreateTable
CREATE TABLE "_OrderItems" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OrderItems_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderID_key" ON "Payment"("orderID");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionID_key" ON "Payment"("transactionID");

-- CreateIndex
CREATE UNIQUE INDEX "ChallanDetails_orderId_key" ON "ChallanDetails"("orderId");

-- CreateIndex
CREATE INDEX "_OrderItems_B_index" ON "_OrderItems"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Order_paymentID_key" ON "Order"("paymentID");

-- AddForeignKey
ALTER TABLE "TruckDetails" ADD CONSTRAINT "TruckDetails_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "Transporter"("transporterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsignorConsignee" ADD CONSTRAINT "ConsignorConsignee_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "Transporter"("transporterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemDetails" ADD CONSTRAINT "ItemDetails_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "Transporter"("transporterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemDetails" ADD CONSTRAINT "ItemDetails_customerID_fkey" FOREIGN KEY ("customerID") REFERENCES "ConsignorConsignee"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceProviderDetails" ADD CONSTRAINT "ServiceProviderDetails_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "Transporter"("transporterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Station" ADD CONSTRAINT "Station_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "Transporter"("transporterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "Transporter"("transporterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "Transporter"("transporterId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_assignedTruckId_fkey" FOREIGN KEY ("assignedTruckId") REFERENCES "TruckDetails"("truckId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "ConsignorConsignee"("customerId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "OrderStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_eWayID_fkey" FOREIGN KEY ("eWayID") REFERENCES "EwayBillDetails"("eWayID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderID_fkey" FOREIGN KEY ("orderID") REFERENCES "Order"("orderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "ConsignorConsignee"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallanDetails" ADD CONSTRAINT "ChallanDetails_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "TruckDetails"("truckId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallanDetails" ADD CONSTRAINT "ChallanDetails_customerID_fkey" FOREIGN KEY ("customerID") REFERENCES "ConsignorConsignee"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallanDetails" ADD CONSTRAINT "ChallanDetails_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("orderId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallanOrderMap" ADD CONSTRAINT "ChallanOrderMap_challanId_fkey" FOREIGN KEY ("challanId") REFERENCES "ChallanDetails"("challanID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallanOrderMap" ADD CONSTRAINT "ChallanOrderMap_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("orderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderItems" ADD CONSTRAINT "_OrderItems_A_fkey" FOREIGN KEY ("A") REFERENCES "ItemDetails"("itemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderItems" ADD CONSTRAINT "_OrderItems_B_fkey" FOREIGN KEY ("B") REFERENCES "Order"("orderId") ON DELETE CASCADE ON UPDATE CASCADE;
