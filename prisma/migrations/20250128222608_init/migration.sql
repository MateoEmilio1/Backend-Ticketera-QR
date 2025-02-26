-- CreateTable
CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "nombreCategoria" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organizacion" (
    "idOrganizacion" SERIAL NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "mail" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "quit" TEXT NOT NULL,
    "contraseña" TEXT NOT NULL,

    CONSTRAINT "Organizacion_pkey" PRIMARY KEY ("idOrganizacion")
);

-- CreateTable
CREATE TABLE "Evento" (
    "idEvento" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL,
    "fechaHoraEvento" TIMESTAMP(3) NOT NULL,
    "capacidadMax" INTEGER NOT NULL,
    "descripcion" TEXT,
    "idCategoria" INTEGER NOT NULL,
    "idOrganizacion" INTEGER NOT NULL,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("idEvento")
);

-- CreateTable
CREATE TABLE "TipoTicket" (
    "idTipoTicket" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "precio" DECIMAL(65,30) NOT NULL,
    "acceso" TEXT NOT NULL,
    "cantMaxPorTipo" INTEGER NOT NULL,
    "idEvento" INTEGER NOT NULL,

    CONSTRAINT "TipoTicket_pkey" PRIMARY KEY ("idTipoTicket")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "idCliente" SERIAL NOT NULL,
    "contraseña" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "tipoDoc" TEXT NOT NULL,
    "nroDoc" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "mail" TEXT NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("idCliente")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "nroTicket" SERIAL NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL,
    "tokenQr" TEXT NOT NULL,
    "idTipoTicket" INTEGER NOT NULL,
    "idCliente" INTEGER NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("nroTicket")
);

-- CreateTable
CREATE TABLE "Politica" (
    "fechaVigencia" TIMESTAMP(3) NOT NULL,
    "tiempoReembolso" INTEGER NOT NULL,

    CONSTRAINT "Politica_pkey" PRIMARY KEY ("fechaVigencia")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organizacion_mail_key" ON "Organizacion"("mail");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_nroDoc_key" ON "Cliente"("nroDoc");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_mail_key" ON "Cliente"("mail");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_tokenQr_key" ON "Ticket"("tokenQr");

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_idCategoria_fkey" FOREIGN KEY ("idCategoria") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_idOrganizacion_fkey" FOREIGN KEY ("idOrganizacion") REFERENCES "Organizacion"("idOrganizacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipoTicket" ADD CONSTRAINT "TipoTicket_idEvento_fkey" FOREIGN KEY ("idEvento") REFERENCES "Evento"("idEvento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_idTipoTicket_fkey" FOREIGN KEY ("idTipoTicket") REFERENCES "TipoTicket"("idTipoTicket") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "Cliente"("idCliente") ON DELETE RESTRICT ON UPDATE CASCADE;
