import { Rol, Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import { Request, Response } from "express";
import { encrypt } from "../utils/handleCrypt.js";

const crearCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      mail,
      contraseña,
      nombre,
      apellido,
      tipoDoc,
      nroDoc,
      fechaNacimiento,
      telefono,
    } = req.body;

    const hashedPassword = await encrypt(contraseña);
    const nuevoCliente = await prisma.cliente.create({
      data: {
        nombre,
        apellido,
        tipoDoc,
        nroDoc,
        fechaNacimiento: new Date(fechaNacimiento),
        telefono,
        usuario: {
          create: {
            mail,
            contraseña: hashedPassword,
            rol: Rol.CLIENTE,
          },
        },
      },
      include: {
        usuario: true,
      },
    });

    res.status(200).json({
      message: "Cliente creado con éxito",
      data: nuevoCliente,
      error: false,
    });
  } catch (error) {
    console.error("Error en crearCliente", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = error.meta?.target as string[];
        let message = "Ya existe un registro con estos datos únicos";

        if (target.includes("mail")) {
          message = "El correo electrónico ya está registrado";
        } else if (target.includes("nroDoc")) {
          message = "El número de documento ya está registrado";
        }

        res.status(400).json({
          message,
          error: true,
        });
        return;
      }
    }

    res.status(500).json({
      message: "Error al crear el cliente",
      error: true,
      details: (error as Error).message,
    });
  }
};

const obtenerClientes = async (req: Request, res: Response): Promise<void> => {
  try {
    const clientes = await prisma.cliente.findMany({
      include: {
        usuario: {
          select: {
            mail: true,
            rol: true,
          },
        },
      },
    });
    res.status(200).json({
      message: "Clientes obtenidos con éxito",
      data: clientes,
      error: false,
    });
  } catch (error) {
    console.error("Error en obtenerClientes:", error);
    res.status(500).json({
      message: "Error al obtener los clientes",
      error: true,
      details: (error as Error).message,
    });
  }
};

const obtenerClientePorId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const cliente = await prisma.cliente.findUnique({
      where: { idCliente: parseInt(id) },
      include: {
        usuario: {
          select: {
            mail: true,
            rol: true,
          },
        },
      },
    });

    if (!cliente) {
      res.status(404).json({
        message: "Cliente no encontrado",
        error: true,
      });
      return;
    }

    res.status(200).json({
      message: "Cliente obtenido con éxito",
      data: cliente,
      error: false,
    });
  } catch (error) {
    console.error("Error en obtenerClientePorId:", error);
    res.status(500).json({
      message: "Error al obtener el cliente",
      error: true,
      details: (error as Error).message,
    });
  }
};

const eliminarCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const clienteEliminado = await prisma.cliente.delete({
      where: { idCliente: parseInt(id) },
    });
    if (!clienteEliminado) {
      res.status(404).json({
        message: "Cliente no encontrado",
        error: true,
      });
      return;
    }
    res.status(200).json({
      message: "Cliente eliminado con éxito",
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el cliente",
      error: true,
      details: (error as Error).message,
    });
  }
};

const actualizarCliente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clienteData = req.body;

    const clienteExistente = await prisma.cliente.findUnique({
      where: { idCliente: parseInt(id) },
      include: { usuario: true },
    });

    if (!clienteExistente) {
      res.status(404).json({ message: "Cliente no encontrado", error: true });
      return;
    }

    const [clienteActualizado] = await prisma.$transaction([
      prisma.cliente.update({
        where: { idCliente: parseInt(id) },
        data: {
          nombre: clienteData.nombre,
          apellido: clienteData.apellido,
          tipoDoc: clienteData.tipoDoc,
          nroDoc: clienteData.nroDoc,
          fechaNacimiento: new Date(clienteData.fechaNacimiento),
          telefono: clienteData.telefono,
        },
        include: { usuario: true },
      }),
      prisma.usuario.update({
        where: { idUsuario: clienteExistente.idUsuario },
        data: {
          mail: clienteData.mail,
          ...(clienteData.contraseña && {
            contraseña: await encrypt(clienteData.contraseña),
          }),
        },
      }),
    ]);

    res.status(200).json({
      message: "Cliente actualizado con éxito",
      data: clienteActualizado,
      error: false,
    });
  } catch (error) {
    console.error("Error en actualizarCliente:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = error.meta?.target as string[];
        let message = "Ya existe un registro con estos datos únicos";

        if (target.includes("mail")) {
          message = "El correo electrónico ya está en uso por otro usuario";
        } else if (target.includes("nroDoc")) {
          message = "El número de documento ya está en uso por otro cliente";
        }

        res.status(400).json({
          message,
          error: true,
        });
        return;
      }
    }

    res.status(500).json({
      message: "Error al actualizar el cliente",
      error: true,
      details: (error as Error).message,
    });
  }
};

const obtenerClientePorIdUsuario = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { idUsuario } = req.params;
    const cliente = await prisma.cliente.findUnique({
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

    if (!cliente) {
      res.status(404).json({
        message: "Cliente no encontrado para este usuario",
        error: true,
      });
      return;
    }

    res.status(200).json({
      message: "Cliente obtenido con éxito",
      data: cliente,
      error: false,
    });
  } catch (error) {
    console.error("Error en obtenerClientePorIdUsuario:", error);
    res.status(500).json({
      message: "Error al obtener el cliente por ID de usuario",
      error: true,
      details: (error as Error).message,
    });
  }
};

export default {
  crearCliente,
  obtenerClientes,
  obtenerClientePorId,
  eliminarCliente,
  actualizarCliente,
  obtenerClientePorIdUsuario,
};
