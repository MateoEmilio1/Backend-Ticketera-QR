import { prisma } from "../prisma.js";
import { Request, Response } from "express";
import { Rol } from "@prisma/client";
import { encrypt } from "../utils/handleCrypt.js";

export const crearOrganizacion = async (req: Request, res: Response) => {
  try {
    const { eventos, ...organizacionData } = req.body;

    // Función para validar CUIT (CU08)
    const validarCUIT = (cuit: string): boolean => {
      cuit = cuit.replace(/[-_]/g, "");
      if (cuit.length !== 11 || !/^\d+$/.test(cuit)) return false;
      const [type, number, check] = [
        cuit.substring(0, 2),
        cuit.substring(2, 10),
        cuit.substring(10, 11),
      ];
      const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
      let sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cuit[i]) * multipliers[i];
      }
      let calculatedCheck = 11 - (sum % 11);
      if (calculatedCheck === 11) calculatedCheck = 0;
      if (calculatedCheck === 10) calculatedCheck = 9; // Simplified common case for 20/27/30
      return parseInt(check) === calculatedCheck;
    };

    if (!validarCUIT(organizacionData.cuit)) {
      return res.status(400).json({
        message: "El formato del CUIT es inválido o no supera la validación de integridad",
        error: true,
      });
    }

    const existingOrg = await prisma.organizacion.findUnique({
      where: { cuit: organizacionData.cuit }
    });

    if (existingOrg) {
      return res.status(400).json({
        message: "Ya existe una organización registrada con este CUIT",
        error: true
      });
    }

    const hashedPassword = await encrypt(organizacionData.contraseña);
    const organizacion = await prisma.organizacion.create({
      data: {
        nombre: organizacionData.nombre,
        cuit: organizacionData.cuit,
        ubicacion: organizacionData.ubicacion,
        ...(eventos?.length > 0 ? { eventos: { create: eventos } } : {}),
        usuario: {
          create: {
            mail: organizacionData.mail,
            contraseña: hashedPassword,
            rol: Rol.ORGANIZACION,
          },
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
};

const obtenerOrganizaciones = async (req: Request, res: Response) => {
  try {
    const organizaciones = await prisma.organizacion.findMany({
      include: {
        usuario: {
          select: {
            mail: true,
          },
        },
      },
    });
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
};

const obtenerOrganizacionPorId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const organizacion = await prisma.organizacion.findUnique({
      where: { idOrganizacion: parseInt(id) },
      include: {
        usuario: {
          select: {
            mail: true,
          },
        },
      },
    });

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
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener la organización",
      error: true,
      details: (error as Error).message,
    });
  }
};
const eliminarOrganizacion = async (
  req: Request,
  res: Response
): Promise<void> => {
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
};

const actualizarOrganizacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { eventos, ...organizacionData } = req.body;

    const organizacionExistente = await prisma.organizacion.findUnique({
      where: { idOrganizacion: parseInt(id) },
      include: { usuario: true },
    });

    if (!organizacionExistente) {
      res.status(404).json({ message: "Organización no encontrada", error: true });
      return;
    }

    const [organizacionActualizada] = await prisma.$transaction([
      prisma.organizacion.update({
        where: { idOrganizacion: parseInt(id) },
        data: {
          nombre: organizacionData.nombre,
          cuit: organizacionData.cuit,
          ubicacion: organizacionData.ubicacion,
          ...(eventos?.length > 0 ? { eventos: { create: eventos } } : {}),
        },
        include: { usuario: true },
      }),
      prisma.usuario.update({
        where: { idUsuario: organizacionExistente.idUsuario },
        data: {
          mail: organizacionData.mail,
          ...(organizacionData.contraseña && {
            contraseña: await encrypt(organizacionData.contraseña),
          }),
        },
      }),
    ]);

    res.status(200).json({
      message: "Organización actualizada con éxito",
      data: organizacionActualizada,
      error: false,
    });
  } catch (error) {
    console.error("Error en actualizarOrganizacion:", error);
    res.status(500).json({
      message: "Error al actualizar la organización",
      error: true,
      details: (error as Error).message,
    });
  }
};

const obtenerOrganizacionPorIdUsuario = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { idUsuario } = req.params;
    const organizacion = await prisma.organizacion.findUnique({
      where: { idUsuario: parseInt(idUsuario) },
      include: {
        usuario: {
          select: {
            mail: true,
            rol: true,
          },
        },
      },
    });

    if (!organizacion) {
      res.status(404).json({
        message: "Organización no encontrada para este usuario",
        error: true,
      });
      return;
    }

    res.status(200).json({
      message: "Organización obtenida con éxito",
      data: organizacion,
      error: false,
    });
  } catch (error) {
    console.error("Error en obtenerOrganizacionPorIdUsuario:", error);
    res.status(500).json({
      message: "Error al obtener la organización por ID de usuario",
      error: true,
      details: (error as Error).message,
    });
  }
};
export default {
  crearOrganizacion,
  obtenerOrganizaciones,
  obtenerOrganizacionPorId,
  eliminarOrganizacion,
  actualizarOrganizacion,
  obtenerOrganizacionPorIdUsuario,
};
