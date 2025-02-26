/*
  Warnings:

  - The primary key for the `Categoria` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Categoria` table. All the data in the column will be lost.
  - You are about to drop the column `quit` on the `Organizacion` table. All the data in the column will be lost.
  - Added the required column `foto` to the `Evento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cuit` to the `Organizacion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Evento" DROP CONSTRAINT "Evento_idCategoria_fkey";

-- AlterTable
ALTER TABLE "Categoria" DROP CONSTRAINT "Categoria_pkey",
DROP COLUMN "id",
ADD COLUMN     "idCategoria" SERIAL NOT NULL,
ADD CONSTRAINT "Categoria_pkey" PRIMARY KEY ("idCategoria");

-- AlterTable
ALTER TABLE "Evento" ADD COLUMN     "foto" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Organizacion" DROP COLUMN "quit",
ADD COLUMN     "cuit" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_idCategoria_fkey" FOREIGN KEY ("idCategoria") REFERENCES "Categoria"("idCategoria") ON DELETE RESTRICT ON UPDATE CASCADE;
