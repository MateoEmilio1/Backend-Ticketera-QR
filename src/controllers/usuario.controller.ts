import { Rol } from "@prisma/client";
import { prisma } from "../prisma.js";
import { Request, Response } from "express";
import { encrypt, verified } from "../utils/handleCrypt.js";
import { generateToken } from "../utils/jwt.handle.js";

// Solo crea ADMINS
const crearUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mail, contraseña } = req.body;
    const hashedPassword = await encrypt(contraseña);
    const usuario = await prisma.usuario.create({
      data: {
        mail,
        contraseña: hashedPassword,
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

const obtenerUsuario = async (req: Request, res: Response) => {
  try {
    const usuarios = await prisma.usuario.findMany();
    res.json({ data: usuarios }); // <- esto es clave
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

const loginUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mail, contraseña } = req.body;

    if (!mail || !contraseña) {
      res.status(400).json({
        message: "Email y contraseña son requeridos",
        error: true,
      });
      return;
    }

    const usuario = await prisma.usuario.findUnique({
      where: { mail },
    });

    if (!usuario) {
      res.status(401).json({
        message: "Usuario o contraseña incorrectos",
        error: true,
      });
      return;
    }

    const contraseñaCorrecta = await verified(contraseña, usuario.contraseña);

    console.log({ contraseñaCorrecta })
    if (!contraseñaCorrecta) {
      res.status(401).json({
        message: "Usuario o contraseña incorrectos",
        error: true,
      });
      return;
    }

    const token = generateToken(String(usuario.idUsuario), usuario.rol);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 dia
    });

    res.status(200).json({
      message: "Login exitoso",
      error: false,
    });
  } catch (error) {
    console.error("Error en loginUsuario:", error);
    res.status(500).json({
      message: "Error al hacer login",
      error: true,
      details: (error as Error).message,
    });
  }
};

const logoutUsuario = (req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout exitoso" });
};


const getUsuarioLogueado = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const user = req.user; // podriamos editar el tipo Request para que tenga el usuario
    res.send(user);
  } catch (e) {
    res.status(500);
    res.send("ERROR_CHECK_SESSION");
  }
}

export default { crearUsuario, obtenerUsuario, loginUsuario, getUsuarioLogueado, logoutUsuario };
