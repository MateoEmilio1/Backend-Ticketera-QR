/*
  Warnings:

  - A unique constraint covering the columns `[nombreCategoria]` on the table `Categoria` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ubicacion` to the `Evento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Evento" ADD COLUMN     "ubicacion" TEXT NOT NULL,
ALTER COLUMN "fechaCreacion" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombreCategoria_key" ON "Categoria"("nombreCategoria");
