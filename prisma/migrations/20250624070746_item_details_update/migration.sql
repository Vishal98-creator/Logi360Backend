-- AlterTable
ALTER TABLE "ItemDetails" ADD COLUMN     "orderId" TEXT;

-- AddForeignKey
ALTER TABLE "ItemDetails" ADD CONSTRAINT "ItemDetails_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("orderId") ON DELETE SET NULL ON UPDATE CASCADE;
