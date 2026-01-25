import { prisma } from "../prisma.js";
import { Request, Response } from "express";
import { randomBytes } from "crypto";
import QRCode from "qrcode";

const crearTicket = async (req: Request, res: Response) => {
  try {
    const tokenQr = randomBytes(16).toString("hex");
    req.body.tokenQr = tokenQr;

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
};

//Obtener Tickets existentes

const obtenerTickets = async (req: Request, res: Response) => {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        cliente: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        tipoTicket: {
          select: {
            precio: true,
            acceso: true,
            evento: {
              select: {
                nombre: true,
                fechaHoraEvento: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      message: "Tickets obtenidos con éxito",
      data: tickets,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los Tickets",
      error: true,
      details: (error as Error).message,
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
            apellido: true,
          },
        },
        tipoTicket: {
          select: {
            precio: true,
            acceso: true,
            evento: {
              select: {
                nombre: true,
                fechaHoraEvento: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      res.status(404).json({
        message: "Ticket no encontrado",
        error: true,
      });
      return;
    }

    res.status(200).json({
      message: "Ticket obtenido con éxito",
      data: ticket,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el Ticket",
      error: true,
      details: (error as Error).message,
    });
  }
};

const obtenerTicketsPorIdCliente = async (req: Request, res: Response) => {
  try {
    console.log(req.params); // Para depuración

    const { idCliente } = req.params;

    // Validar si idCliente existe y es un número válido
    if (!idCliente || isNaN(Number(idCliente))) {
      res.status(400).json({
        message: "El ID de cliente es inválido",
        error: true,
      });
      return;
    }

    const tickets = await prisma.ticket.findMany({
      where: { idCliente: Number(idCliente) }, // Convertimos a número de manera segura
      include: {
        cliente: {
          select: {
            nombre: true,
            apellido: true,
            nroDoc: true,
          },
        },
        tipoTicket: {
          select: {
            precio: true,
            acceso: true,
            evento: {
              select: {
                nombre: true,
                fechaHoraEvento: true,
              },
            },
          },
        },
      },
    });

    if (!tickets.length) {
      res.status(404).json({
        message: "No existen tickets pertenecientes a este cliente",
        error: true,
        data: []
      });
      return;
    }

    res.status(200).json({
      message: "Tickets obtenidos con éxito",
      data: tickets,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los tickets",
      error: true,
      details: (error as Error).message,
    });
  }
};

// Validar Ticket (QR)
const validarTicket = async (req: Request, res: Response) => {
  try {
    const { tokenQr } = req.params;
    if (!tokenQr) {
      res.status(400).json({
        message: "Token QR es requerido",
        error: true,
      });
      return;
    }

    const ticket = await prisma.ticket.findUnique({
      where: { tokenQr },
      include: {
        tipoTicket: {
          include: {
            evento: true
          }
        },
        cliente: true
      }
    });

    if (!ticket) {
      res.status(404).json({
        message: "Ticket no encontrado",
        error: true,
      });
      return;
    }

    res.status(200).json({
      message: "Ticket válido",
      data: ticket,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al validar el ticket",
      error: true,
      details: (error as Error).message,
    });
  }
};

// Consumir Ticket (QR)
const consumirTicket = async (req: Request, res: Response) => {
  try {
    const { tokenQr } = req.params;

    if (!tokenQr) {
      res.status(400).json({
        message: "Token QR es requerido",
        error: true,
      });
      return;
    }

    const ticket = await prisma.ticket.findUnique({
      where: { tokenQr },
    });

    if (!ticket) {
      res.status(404).json({
        message: "Ticket no encontrado",
        error: true,
      });
      return;
    }

    if (ticket.estado === 'consumido') {
      res.status(400).json({
        message: "El ticket ya ha sido consumido",
        error: true,
      });
      return;
    }

    if (ticket.estado === 'expirado' || ticket.estado === 'reembolsado') {
      res.status(400).json({
        message: `El ticket no es válido (Estado: ${ticket.estado})`,
        error: true,
      });
      return;
    }

    const ticketActualizado = await prisma.ticket.update({
      where: { tokenQr },
      data: { estado: 'consumido' },
    });

    res.status(200).json({
      message: "Ticket consumido con éxito",
      data: ticketActualizado,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al consumir el ticket",
      error: true,
      details: (error as Error).message,
    });
  }
};


//Eliminar Ticket

const eliminarTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const ticketEliminado = await prisma.ticket.delete({
      where: { nroTicket: parseInt(id) },
    });

    if (!ticketEliminado) {
      res.status(404).json({
        message: "Ticket no encontrado",
        error: true,
      });
      return;
    }

    res.status(200).json({
      message: "Ticket eliminado con éxito",
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el Ticket",
      error: true,
      details: (error as Error).message,
    });
  }
};

//Actualizar Ticket

const actualizarTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ticketData = req.body;

    const ticketActualizado = await prisma.ticket.update({
      where: { nroTicket: parseInt(id) },
      data: ticketData,
    });

    res.status(200).json({
      message: "Ticket actualizado con éxito",
      data: ticketActualizado,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el Ticket",
      error: true,
      details: (error as Error).message,
    });
  }
};

export default {
  crearTicket,
  obtenerTickets,
  obtenerTicketPorId,
  eliminarTicket,
  actualizarTicket,
  obtenerTicketsPorIdCliente,
  validarTicket,
  consumirTicket,
};
