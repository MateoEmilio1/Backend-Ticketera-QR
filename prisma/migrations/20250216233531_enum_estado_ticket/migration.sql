/*
  Warnings:

  - The `estado` column on the `Ticket` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EstadoTicket" AS ENUM ('pagado', 'consumido', 'expirado', 'reembolsado');

-- AlterTable
ALTER TABLE "Politica" ALTER COLUMN "fechaVigencia" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Ticket" ALTER COLUMN "fechaCreacion" SET DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoTicket" NOT NULL DEFAULT 'pagado';
