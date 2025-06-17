/*
  Warnings:

  - A unique constraint covering the columns `[gstin]` on the table `ConsignorConsignee` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ConsignorConsignee_gstin_key" ON "ConsignorConsignee"("gstin");
