import { prisma } from "../prisma.js";
import { Request, Response } from "express";

// Crear una Politica
export const crearPolitica = async (req: Request, res: Response): Promise<void> => {
  try {
    const { diasReembolso, fechaVigencia } = req.body;
    const politica = await prisma.politica.create({
      data: {
        diasReembolso: Number(diasReembolso),
        fechaVigencia: fechaVigencia ? new Date(fechaVigencia) : new Date()
      },
    });

    res.status(200).json({
      message: "Politica creado con éxito",
      data: politica,
      error: false,
    });
  } catch (error) {
    console.error("Error en crearPolitica", error);
    res.status(500).json({
      message: "Error al crear la politica",
      error: true,
      details: (error as Error).message,
    });
  }
};

// Obtener Politicas existentes
export const obtenerPoliticas = async (req: Request, res: Response): Promise<void> => {
  try {
    const politicasRaw = await prisma.politica.findMany({
      orderBy: {
        fechaVigencia: 'desc'
      }
    });

    const politicas = politicasRaw.map((p, index) => ({
      ...p,
      vigente: index === 0,
      estado: index === 0 ? "Vigente" : "No vigente"
    }));

    res.status(200).json({
      message: "Politicas obtenidos con éxito",
      data: politicas,
      error: false,
    });
  } catch (error) {
    console.error("Error en obtenerPoliticas:", error);
    res.status(500).json({
      message: "Error al obtener las Politicas",
      error: true,
      details: (error as Error).message,
    });
  }
};

// Obtener Politica Actual (la más reciente)
export const obtenerPoliticaActual = async (req: Request, res: Response): Promise<void> => {
  try {
    const politica = await prisma.politica.findFirst({
      orderBy: {
        fechaVigencia: 'desc'
      }
    });

    if (!politica) {
      res.status(404).json({
        message: "No se encontró ninguna política",
        error: true
      });
      return;
    }

    const politicaConEstado = {
      ...politica,
      vigente: true,
      estado: "Vigente"
    };

    res.status(200).json({
      message: "Politica actual obtenida con éxito",
      data: politicaConEstado,
      error: false,
    });
  } catch (error) {
    console.error("Error en obtenerPoliticaActual:", error);
    res.status(500).json({
      message: "Error al obtener la Politica actual",
      error: true,
      details: (error as Error).message,
    });
  }
};

export default {
  crearPolitica,
  obtenerPoliticas,
  obtenerPoliticaActual
};