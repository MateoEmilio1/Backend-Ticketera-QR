import { Rol } from "@prisma/client";
import { prisma } from "../prisma.js";
import { Request, Response } from "express";
import { encrypt, verified } from "../utils/handleCrypt.js";
import { generateToken } from "../utils/jwt.handle.js";
import * as crypto from "crypto";
import { sendPasswordResetEmail } from "../services/emailService.js";

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
      data: {
        idUsuario: usuario.idUsuario,
        mail: usuario.mail,
        rol: usuario.rol
      },
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
    const usuarios = await prisma.usuario.findMany({
      select: {
        idUsuario: true,
        mail: true,
        rol: true
      }
    });
    res.json({ data: usuarios }); // <- esto es clave
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

const loginUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mail, contraseña } = req.body;

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

const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mail } = req.body;

    const usuario = await prisma.usuario.findUnique({ where: { mail } });
    if (!usuario) {
      // Por seguridad, no revelamos si el usuario existe o no
      res.status(200).json({ message: "Si el correo está registrado, recibirás un enlace", error: false });
      return;
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hora

    await prisma.usuario.update({
      where: { idUsuario: usuario.idUsuario },
      data: {
        resetToken: token,
        resetTokenExpires: expires
      }
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
    await sendPasswordResetEmail(mail, resetUrl);

    res.status(200).json({ message: "Si el correo está registrado, recibirás un enlace", error: false });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    res.status(500).json({ message: "Error al procesar solicitud", error: true });
  }
};

const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, nuevaContraseña } = req.body;

    const usuario = await prisma.usuario.findUnique({
      where: {
        resetToken: token as string
      }
    });

    if (!usuario || !usuario.resetTokenExpires || new Date(usuario.resetTokenExpires) < new Date()) {
      res.status(400).json({ message: "Token inválido o expirado", error: true });
      return;
    }

    const hashedPassword = await encrypt(nuevaContraseña);

    await prisma.usuario.update({
      where: { idUsuario: usuario.idUsuario },
      data: {
        contraseña: hashedPassword,
        resetToken: null,
        resetTokenExpires: null
      }
    });

    res.status(200).json({ message: "Contraseña actualizada con éxito", error: false });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    res.status(500).json({ message: "Error al restablecer contraseña", error: true });
  }
};

export default { crearUsuario, obtenerUsuario, loginUsuario, getUsuarioLogueado, logoutUsuario, forgotPassword, resetPassword };
