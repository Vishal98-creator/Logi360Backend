/*
  Warnings:

  - A unique constraint covering the columns `[transporterId,truckNo]` on the table `TruckDetails` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TruckDetails_transporterId_truckNo_key" ON "TruckDetails"("transporterId", "truckNo");
