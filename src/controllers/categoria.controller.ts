import { prisma } from "../prisma.js";
import { Request, Response } from "express";

export const crearCategoria = async (req: Request, res: Response): Promise<void> => {
  try {
    const categoriaExistente = await prisma.categoria.findFirst({
      where: {
        nombreCategoria: {
          equals: req.body.nombreCategoria,
          mode: 'insensitive'
        }
      }
    });

    if (categoriaExistente) {
      res.status(400).json({
        message: "Error de validación",
        error: true,
        details: [
          {
            path: "nombreCategoria",
            message: "Ya existe una categoría con ese nombre"
          }
        ]
      });
      return;
    }

    const categoria = await prisma.categoria.create({
      data: {
        nombreCategoria: req.body.nombreCategoria,
      },
    });

    res.status(200).json({
      message: "Categoria creado con éxito",
      data: categoria,
      error: false,
    });
  } catch (error) {
    console.error("Error en crearCategoria", error);
    res.status(500).json({
      message: "Error al crear la categoria",
      error: true,
      details: (error as Error).message,
    });
  }
};

export const obtenerCategorias = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre } = req.query;

    const whereClause: any = {};
    if (nombre) {
      whereClause.nombreCategoria = {
        contains: String(nombre),
        mode: 'insensitive'
      };
    }

    const categorias = await prisma.categoria.findMany({
      where: whereClause
    });

    res.status(200).json({
      message: "categorias obtenidos con éxito",
      data: categorias,
      error: false,
    });
  } catch (error) {
    console.error("Error en obtenerCategorias:", error);
    res.status(500).json({
      message: "Error al obtener las Categorias",
      error: true,
      details: (error as Error).message,
    });
  }
};

export const obtenerCategoriaPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const categoria = await prisma.categoria.findUnique({
      where: { idCategoria: parseInt(id) },
    });

    if (!categoria) {
      res.status(404).json({
        message: "Categoría no encontrada",
        error: true,
      });
      return;
    }

    res.status(200).json({
      message: "Categoría obtenida con éxito",
      data: categoria,
      error: false,
    });
  } catch (error) {
    console.error("Error en obtenerCategoriaPorId", error);
    res.status(500).json({
      message: "Error al obtener la categoría",
      error: true,
      details: (error as Error).message,
    });
  }
};

export const actualizarCategoria = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.body.nombreCategoria) {
      const categoriaExistente = await prisma.categoria.findFirst({
        where: {
          nombreCategoria: {
            equals: req.body.nombreCategoria,
            mode: 'insensitive'
          },
          idCategoria: {
            not: parseInt(id)
          }
        }
      });

      if (categoriaExistente) {
        res.status(400).json({
          message: "Error de validación",
          error: true,
          details: [
            {
              path: "nombreCategoria",
              message: "Ya existe otra categoría con ese nombre"
            }
          ]
        });
        return;
      }
    }

    const categoriaActualizada = await prisma.categoria.update({
      where: { idCategoria: parseInt(id) },
      data: req.body,
    });
    res.status(200).json({
      message: "Categoría actualizada con éxito",
      data: categoriaActualizada,
      error: false,
    });
  } catch (error) {
    console.error("Error en actualizarCategoria", error);
    res.status(500).json({
      message: "Error al actualizar la categoría",
      error: true,
      details: (error as Error).message,
    });
  }
};

export const eliminarCategoria = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const categoriaEliminada = await prisma.categoria.delete({
      where: { idCategoria: parseInt(id) },
    });
    if (!categoriaEliminada) {
      res.status(404).json({
        message: "Categoria no encontrada",
        error: true,
      });
      return;
    }
    res.status(200).json({
      message: "Categoria eliminada con éxito",
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar la categoria",
      error: true,
      details: (error as Error).message,
    });
  }
};

export default {
  crearCategoria,
  obtenerCategorias,
  obtenerCategoriaPorId,
  actualizarCategoria,
  eliminarCategoria,
};
