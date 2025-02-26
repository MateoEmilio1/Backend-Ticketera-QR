import { error } from "console";
import {prisma} from "../prisma.js"
import { Request, Response } from "express";

// Crear un Evento
const crearEvento = async (req: Request, res: Response) => {
  try {
    //Extraer datos del body
    const {
      nombre,
      fechaCreacion,
      fechaHoraEvento,
      capacidadMax,
      descripcion,
      foto,
      idCategoria,
      idOrganizacion,
      tipoTickets, // Array de tipos de tickets [{ tipo, precio, acceso, cantMaxPorTipo }, ...]
    } = req.body;

    // Validaciones básicas
    if (!nombre || !fechaCreacion || !fechaHoraEvento || !capacidadMax || !foto || !idCategoria || !idOrganizacion) {
      return res.status(400).json({ message: "Todos los campos son obligatorios", error: true });
    }

    if (!Array.isArray(tipoTickets) || tipoTickets.length === 0) {
      return res.status(400).json({ message: "Debe incluir al menos un tipo de ticket", error: true });
    }

    // Convertir fechas a objetos Date y crear el evento con sus tipoTickets en una sola transacción
    const evento = await prisma.evento.create({
      data: {
        nombre,
        fechaCreacion: new Date(fechaCreacion),
        fechaHoraEvento: new Date(fechaHoraEvento),
        capacidadMax,
        descripcion: descripcion || null,
        foto,
        categoria: {
          connect: { idCategoria },
        },
        organizacion: {
          connect: { idOrganizacion },
        },
        tipoTickets: {
          create: tipoTickets.map(ticket => ({
            tipo: ticket.tipo,
            precio: ticket.precio,
            acceso: ticket.acceso,
            cantMaxPorTipo: ticket.cantMaxPorTipo
          })),
        },
      },
      include: {
        tipoTickets: true, // Para devolver los tickets creados junto con el evento
      },
    });

    res.status(201).json({ message: "Evento creado con éxito", evento });
    
  } catch (error) {
    console.error("Error al crear el evento:", error);
    res.status(500).json({ message: "Error interno del servidor", error: true });
  }
};

const obtenerEventos = async (req: Request, res: Response) => {
  try {
    const eventos = await prisma.evento.findMany({
      include: {
        tipoTickets: true, // Trae todos los datos de los tipoTickets asociados
      },
    });

    res.status(200).json({
      message: "Eventos obtenidos con éxito",
      data: eventos,
      error: false,
    });

  } catch (error) {
    console.error("Error en obtenerEventos:", error);
    res.status(500).json({
      message: "Error al obtener los eventos",
      error: true,
      details: (error as Error).message,
    });
  }
};

const obtenerEventosPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const evento = await prisma.evento.findUnique({
      where: { idEvento: parseInt(id) },
      include: {
        tipoTickets: true, // Trae toda la información de los tipoTickets
      },
    });

    if (!evento) {
      res.status(404).json({
        message: "Evento no encontrado",
        error: true,
      });
      return;
    }

    res.status(200).json({
      message: "Evento obtenido con éxito",
      data: evento,
      error: false,
    });

  } catch (error) {
    console.error("Error en obtenerEventoPorId:", error);
    res.status(500).json({
      message: "Error al obtener el evento",
      error: true,
      details: (error as Error).message,
    });
  }
};



const eliminarEvento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const eventoEliminado = await prisma.evento.delete({
      where: { idEvento: parseInt(id) },
    });
    if (!eventoEliminado) {
      res.status(404).json({
        message: "Evento no encontrado",
        error: true,
      });
      return;
    }
    res.status(200).json({
      message: "Evento eliminado con éxito",
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el Evento",
      error: true,
      details: (error as Error).message,
    });
  }
}

const actualizarEvento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const EventoData = req.body;
    const EventoActualizado = await prisma.evento.update({
      where: { idEvento: parseInt(id) },
      data: EventoData,
    });

    res.status(200).json({
      message: "Evento actualizado con éxito",
      data: EventoActualizado,
      error: false,
    });
  }catch (error) { 
    res.status(500).json({
      message: "Error al actualizar el Evento",
      error: true,
      details: (error as Error).message,
    });
  }
}

export default { obtenerEventos, obtenerEventosPorId, eliminarEvento, actualizarEvento, crearEvento };
