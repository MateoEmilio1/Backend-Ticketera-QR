-- AlterEnum
ALTER TYPE "EstadoTicket" ADD VALUE 'pendiente';

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "metodoPago" TEXT;

-- AlterTable
ALTER TABLE "TipoTicket" ADD COLUMN     "sector" TEXT;
