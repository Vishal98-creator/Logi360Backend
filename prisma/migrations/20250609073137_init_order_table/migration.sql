-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "invoiceKey" TEXT NOT NULL,
    "invoiceFileName" TEXT NOT NULL,
    "consignerName" TEXT,
    "consignorName" TEXT,
    "gstinNumber" TEXT,
    "destination" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
