import { Rol } from "@prisma/client";
import { prisma } from "../prisma.js";
import { Request, Response } from "express";

const crearUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mail, contraseña } = req.body;
    const usuario = await prisma.usuario.create({
      data: {
        mail,
        contraseña,
        rol: Rol.ADMIN,
      },
    });
    res.status(201).json({
      message: "Usuario creado con éxito",
      data: usuario,
      error: false,
    });
  } catch (error) {
    console.error("Error en crearUsuario:", error);
    res.status(500).json({
      message: "Error al crear el usuario",
      error: true,
      details: (error as Error).message,
    });
  }
};

export default { crearUsuario };
