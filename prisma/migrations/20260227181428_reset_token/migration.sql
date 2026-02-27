/*
  Warnings:

  - A unique constraint covering the columns `[resetToken]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "EstadoEvento" AS ENUM ('ACTIVO', 'CANCELADO', 'FINALIZADO');

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "telefono" TEXT;

-- AlterTable
ALTER TABLE "Evento" ADD COLUMN     "estado" "EstadoEvento" NOT NULL DEFAULT 'ACTIVO';

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpires" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_resetToken_key" ON "Usuario"("resetToken");
