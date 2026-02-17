/*
  Warnings:

  - You are about to drop the column `tiempoReembolso` on the `Politica` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Politica" DROP COLUMN "tiempoReembolso",
ADD COLUMN     "diasReembolso" INTEGER NOT NULL DEFAULT 7;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "fechaConsumo" TIMESTAMP(3);
