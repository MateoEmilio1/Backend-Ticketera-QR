/*
  Warnings:

  - You are about to drop the column `contraseña` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `mail` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `contraseña` on the `Organizacion` table. All the data in the column will be lost.
  - You are about to drop the column `mail` on the `Organizacion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cuit]` on the table `Organizacion` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Cliente" DROP CONSTRAINT "Cliente_idUsuario_fkey";

-- DropForeignKey
ALTER TABLE "Organizacion" DROP CONSTRAINT "Organizacion_idUsuario_fkey";

-- DropIndex
DROP INDEX "Cliente_mail_key";

-- DropIndex
DROP INDEX "Organizacion_mail_key";

-- AlterTable
ALTER TABLE "Cliente" DROP COLUMN "contraseña",
DROP COLUMN "mail";

-- AlterTable
ALTER TABLE "Organizacion" DROP COLUMN "contraseña",
DROP COLUMN "mail";

-- CreateIndex
CREATE UNIQUE INDEX "Organizacion_cuit_key" ON "Organizacion"("cuit");

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("idUsuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organizacion" ADD CONSTRAINT "Organizacion_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario"("idUsuario") ON DELETE CASCADE ON UPDATE CASCADE;
