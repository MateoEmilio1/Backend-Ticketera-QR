import { prisma } from "../prisma.js";
import { Request, Response } from "express";
import { Rol, Prisma } from "@prisma/client";
import { encrypt } from "../utils/handleCrypt.js";

export const crearOrganizacion = async (req: Request, res: Response) => {
  try {
    const { eventos, ...organizacionData } = req.body;

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

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = error.meta?.target as string[];
        let message = "Ya existe un registro con estos datos únicos";

        if (target.includes("mail")) {
          message = "El correo electrónico ya está registrado";
        } else if (target.includes("cuit")) {
          message = "El CUIT ya está registrado";
        }

        return res.status(400).json({
          message,
          error: true,
        });
      }
    }

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

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = error.meta?.target as string[];
        let message = "Ya existe un registro con estos datos únicos";

        if (target.includes("mail")) {
          message = "El correo electrónico ya está en uso por otra organización";
        } else if (target.includes("cuit")) {
          message = "El CUIT ya está en uso por otra organización";
        }

        return res.status(400).json({
          message,
          error: true,
        });
      }
    }

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
