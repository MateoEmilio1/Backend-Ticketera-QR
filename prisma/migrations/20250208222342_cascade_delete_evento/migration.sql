-- DropForeignKey
ALTER TABLE "TipoTicket" DROP CONSTRAINT "TipoTicket_idEvento_fkey";

-- AddForeignKey
ALTER TABLE "TipoTicket" ADD CONSTRAINT "TipoTicket_idEvento_fkey" FOREIGN KEY ("idEvento") REFERENCES "Evento"("idEvento") ON DELETE CASCADE ON UPDATE CASCADE;
