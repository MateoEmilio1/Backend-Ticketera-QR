/*
  Warnings:

  - A unique constraint covering the columns `[idUsuario]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idUsuario]` on the table `Organizacion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idUsuario` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idUsuario` to the `Organizacion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('CLIENTE', 'ORGANIZACION', 'ADMIN');

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "idUsuario" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Organizacion" ADD COLUMN     "idUsuario" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Usuario" (
    "idUsuario" SERIAL NOT NULL,
    "mail" TEXT NOT NULL,
    "contraseña" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("idUsuario")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_mail_key" ON "Usuario"("mail");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_idUsuario_key" ON "Cliente"("idUsuario");

-- CreateIndex
CREATE UNIQUE INDEX "Organizacion_idUsuario_key" ON "Organizacion"("idUsuario");

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organizacion" ADD CONSTRAINT "Organizacion_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;
