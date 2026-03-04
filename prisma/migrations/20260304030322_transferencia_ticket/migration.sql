-- AlterEnum
ALTER TYPE "EstadoTicket" ADD VALUE 'pendiente_transferencia';

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "ofertaTransferenciaIdCliente" INTEGER;
