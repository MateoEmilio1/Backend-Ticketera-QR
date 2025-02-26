import {prisma} from "../prisma.js"
import { Request, Response } from "express";

// editar un tipo de ticket

const editarTipoTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tipoTicket = await prisma.tipoTicket.update({
      where: { idTipoTicket: parseInt(id) },
      data: req.body,
    });

    res.status(200).json({
      message: "Tipo de ticket actualizado con éxito",
      data: tipoTicket,
      error: false,
    });
  } catch (error) { 
    console.error("Error en editarTipoTicket:", error);
    res.status(500).json({
      message: "Error al editar el tipo de ticket",
      error: true,
      details: (error as Error).message,
    });
  }
}

export default {editarTipoTicket};