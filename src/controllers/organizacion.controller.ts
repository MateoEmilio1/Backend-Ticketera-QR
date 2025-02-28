import { error } from "console";
import {prisma} from "../prisma.js"
import { Request, Response } from "express";

// Crear una organización
export const crearOrganizacion = async (req: Request, res: Response) => {
  try {
    const { eventos, ...organizacionData } = req.body;

    const organizacion = await prisma.organizacion.create({
      data: {
        nombre: organizacionData.nombre,
        cuit: organizacionData.cuit,
        ubicacion: organizacionData.ubicacion,
        ...(eventos?.length > 0 ? { eventos: { create: eventos } } : {}),
        usuario:{
          create: {
            mail: organizacionData.mail,
            contraseña: organizacionData.contraseña,
            rol: "ORGANIZACION",
          }
        },
      },
      include: {
        usuario: true, 
      },
    });

    res.status(200).json({
      message: "Organización creada con éxito",
      data: organizacion,
      error: false,
    });
  } catch (error) {
    console.error("Error en crearOrganizacion:", error);
    res.status(500).json({
      message: "Error al crear la organización",
      error: true,
      details: (error as Error).message,
    });
  }
}

const obtenerOrganizaciones = async (req: Request, res: Response) => {
  try {
    const organizaciones = await prisma.organizacion.findMany({
      include: {
        usuario:{
          select: {
            mail: true,
          },
        },
    }});
    res.status(200).json({
      message: "Organizaciones obtenidas con éxito",
      data: organizaciones,
      error: false,
    });
  } catch (error) {
    console.error("Error en obtenerOrganizaciones:", error);
    res.status(500).json({
      message: "Error al obtener las organizaciones",
      error: true,
      details: (error as Error).message,
    });
  }
}

const obtenerOrganizacionPorId = async (req: Request, res: Response):Promise<void> => {
  try {
    const { id } = req.params;
    const organizacion = await prisma.organizacion.findUnique({
      where: { idOrganizacion: parseInt(id) },
      include: {
        usuario:{
          select: {
            mail: true,
          },
        },
    }});

    if (!organizacion) {
      res.status(404).json({
        message: "Organización no encontrada",
        error: true,
      });
      return;
    }

    res.status(200).json({
      message: "Organización obtenida con éxito",
      data: organizacion,
      error: false,
    });
  }catch (error) {
    res.status(500).json({
      message: "Error al obtener la organización",
      error: true,
      details: (error as Error).message,
    });
  }
}
const eliminarOrganizacion = async (req: Request, res: Response):Promise<void> => {
  try {
    const { id } = req.params;
    const organizacionEliminada = await prisma.organizacion.delete({
      where: { idOrganizacion: parseInt(id) },
    });
    if (!organizacionEliminada) {
      res.status(404).json({
        message: "Organización no encontrada",
        error: true,
      });
      return;
    }
    res.status(200).json({
      message: "Organización eliminada con éxito",
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar la organización",
      error: true,
      details: (error as Error).message,
    });
  }
}

const actualizarOrganizacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { eventos, ...organizacionData } = req.body;

    const organizacionActualizada = await prisma.organizacion.update({
      where: { idOrganizacion: parseInt(id) },
      data: {
        ...organizacionData,
        ...(eventos?.length > 0 ? { eventos: { create: eventos } } : {}),
      },
    });

    res.status(200).json({
      message: "Organización actualizada con éxito",
      data: organizacionActualizada,
      error: false,
    });
  }catch (error) { 
    res.status(500).json({
      message: "Error al actualizar la organización",
      error: true,
      details: (error as Error).message,
    });
  }
}
export default { crearOrganizacion, obtenerOrganizaciones, obtenerOrganizacionPorId, eliminarOrganizacion, actualizarOrganizacion };