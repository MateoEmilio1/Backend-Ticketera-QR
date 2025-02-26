import {prisma} from "../prisma.js"
import { Request, Response } from "express";

//crear un ticket

const crearTicket = async (req: Request, res: Response) => {
  try {
    const ticket = await prisma.ticket.create({
      data: req.body,
    });

    res.status(200).json({
      message: "Ticket creado con éxito",
      data: ticket,
      error: false,
    });
  } catch (error) {
    console.error("Error en crearTicket", error);
    res.status(500).json({
      message: "Error al crear el ticket",
      error: true,
      details: (error as Error).message,
    });
  }
}

//Obtener Tickets existentes

const obtenerTickets = async (req: Request, res: Response) => {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        cliente: {
          select: {
            nombre: true,
            apellido: true
          }
        },
        tipoTicket: {
          select: {
            precio: true,
            acceso: true,
            evento: {
              select: {
                nombre: true,
                fechaHoraEvento: true
              }
            }
          }
        }
      }
    });

    res.status(200).json({
      message: "Tickets obtenidos con éxito",
      data: tickets,
      error: false
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los Tickets",
      error: true,
      details: (error as Error).message
    });
  }
};

//Obtener Ticket por ID

const obtenerTicketPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { nroTicket: parseInt(id) },
      include: {
        cliente: {
          select: {
            nombre: true,
            apellido: true
          }
        },
        tipoTicket: {
          select: {
            precio: true,
            acceso: true,
            evento: {
              select: {
                nombre: true,
                fechaHoraEvento: true
              }
            }
          }
        }
      }
    });

    if (!ticket) {
      res.status(404).json({
        message: "Ticket no encontrado",
        error: true
      });
      return;
    }

    res.status(200).json({
      message: "Ticket obtenido con éxito",
      data: ticket,
      error: false
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el Ticket",
      error: true,
      details: (error as Error).message
    });
  }
};

//Eliminar Ticket

const eliminarTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const ticketEliminado = await prisma.ticket.delete({
      where: { nroTicket: parseInt(id) }
    });

    if (!ticketEliminado) {
      res.status(404).json({
        message: "Ticket no encontrado",
        error: true
      });
      return;
    }

    res.status(200).json({
      message: "Ticket eliminado con éxito",
      error: false
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el Ticket",
      error: true,
      details: (error as Error).message
    });
  }
}

//Actualizar Ticket

const actualizarTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ticketData = req.body;

    const ticketActualizado = await prisma.ticket.update({
      where: { nroTicket: parseInt(id) },
      data: ticketData
    });

    res.status(200).json({
      message: "Ticket actualizado con éxito",
      data: ticketActualizado,
      error: false
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el Ticket",
      error: true,
      details: (error as Error).message
    });
  }
}

export default {crearTicket, obtenerTickets, obtenerTicketPorId, eliminarTicket, actualizarTicket};