import { prisma } from "../prisma.js";
import { Request, Response } from "express";
import { sendEventCancellationEmail, sendEventDateChangeEmail } from "../services/emailService.js";

// Helpers para evitar string[]
const getQueryString = (value: any): string | undefined => {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
};

const getQueryNumber = (value: any): number | undefined => {
  const v = getQueryString(value);
  if (!v) return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
};

// Crear Evento
const crearEvento = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      nombre,
      fechaCreacion,
      fechaHoraEvento,
      capacidadMax,
      descripcion,
      foto,
      ubicacion,
      idCategoria,
      idOrganizacion,
      tipoTickets,
    } = req.body;

    const evento = await prisma.evento.create({
      data: {
        nombre,
        fechaCreacion: new Date(fechaCreacion),
        fechaHoraEvento: new Date(fechaHoraEvento),
        capacidadMax,
        descripcion: descripcion || null,
        ubicacion: ubicacion || null,
        foto,
        categoria: { connect: { idCategoria } },
        organizacion: { connect: { idOrganizacion } },
        tipoTickets: {
          create: tipoTickets.map((ticket: any) => ({
            tipo: ticket.tipo,
            precio: ticket.precio,
            acceso: ticket.acceso,
            cantMaxPorTipo: ticket.cantMaxPorTipo,
          })),
        },
      },
      include: { tipoTickets: true },
    });

    res.status(201).json({ message: "Evento creado con éxito", data: evento });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener eventos
const obtenerEventos = async (req: Request, res: Response) => {
  try {
    const idOrganizacion = getQueryNumber(req.query.idOrganizacion);

    const whereClause: any = {};

    if (idOrganizacion) {
      whereClause.idOrganizacion = idOrganizacion;
    }

    const eventos = await prisma.evento.findMany({
      where: whereClause,
      include: { tipoTickets: true },
    });

    res.status(200).json({
      message: "Eventos obtenidos con éxito",
      data: eventos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener eventos" });
  }
};

// Obtener evento por ID
const obtenerEventosPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const idEvento = Number(req.params.id);

    const evento = await prisma.evento.findUnique({
      where: { idEvento },
      include: { tipoTickets: true },
    });

    if (!evento) {
      res.status(404).json({ message: "Evento no encontrado" });
      return;
    }

    res.status(200).json({ data: evento });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener evento" });
  }
};

// Eliminar evento
const eliminarEvento = async (req: Request, res: Response): Promise<void> => {
  try {
    const idEvento = Number(req.params.id);

    await prisma.evento.delete({
      where: { idEvento },
    });

    res.status(200).json({ message: "Evento eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar evento" });
  }
};

// Cambiar fecha de evento
const cambiarFechaEvento = async (req: Request, res: Response): Promise<void> => {
  try {
    const idEvento = Number(req.params.id);
    const { fechaHoraEvento } = req.body;

    const eventoAntiguo = await prisma.evento.findUnique({
      where: { idEvento },
      include: {
        tipoTickets: {
          include: {
            tickets: {
              where: { estado: "pagado" },
              include: {
                cliente: {
                  include: { usuario: true },
                },
              },
            },
          },
        },
      },
    });

    if (!eventoAntiguo) {
      res.status(404).json({ message: "Evento no encontrado" });
      return;
    }

    const nuevaFecha = new Date(fechaHoraEvento);

    const eventoActualizado = await prisma.evento.update({
      where: { idEvento },
      data: { fechaHoraEvento: nuevaFecha },
    });

    const tickets = eventoAntiguo.tipoTickets.flatMap((t) => t.tickets);

    Promise.allSettled(
      tickets.map((ticket) => {
        const email = ticket.cliente.usuario.mail;
        const nombre = `${ticket.cliente.nombre} ${ticket.cliente.apellido}`;

        return sendEventDateChangeEmail(email, {
          evento: eventoAntiguo.nombre,
          fechaAntigua: eventoAntiguo.fechaHoraEvento.toLocaleString("es-AR"),
          fechaNueva: nuevaFecha.toLocaleString("es-AR"),
          usuario: nombre,
        });
      })
    );

    res.status(200).json({
      message: "Fecha actualizada",
      data: eventoActualizado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al cambiar fecha" });
  }
};

// Estadísticas
const getEstadisticas = async (req: Request, res: Response) => {
  try {
    const fechaInicio = getQueryString(req.query.fechaInicio);
    const fechaFin = getQueryString(req.query.fechaFin);
    const idOrganizacion = getQueryNumber(req.query.idOrganizacion);

    const whereClause: any = {};

    if (idOrganizacion) {
      whereClause.idOrganizacion = idOrganizacion;
    }

    if (fechaInicio || fechaFin) {
      whereClause.fechaHoraEvento = {};
      if (fechaInicio) whereClause.fechaHoraEvento.gte = new Date(fechaInicio);
      if (fechaFin) whereClause.fechaHoraEvento.lte = new Date(fechaFin);
    }

    const eventos = await prisma.evento.findMany({
      where: whereClause,
      include: {
        tipoTickets: {
          include: { tickets: { include: { cliente: true } } },
        },
      },
    });

    const estadisticas = eventos.map((evento) => {
      const tickets = evento.tipoTickets.flatMap((t) => t.tickets);

      const vendidos = tickets.filter(
        (t) => t.estado === "pagado" || t.estado === "consumido"
      ).length;

      const reembolsados = tickets.filter(
        (t) => t.estado === "reembolsado"
      ).length;

      const recaudacion = tickets.reduce((sum, t) => {
        const precio = Number(
          evento.tipoTickets.find((tt) => tt.idTipoTicket === t.idTipoTicket)
            ?.precio || 0
        );
        return sum + precio;
      }, 0);

      return {
        idEvento: evento.idEvento,
        nombre: evento.nombre,
        vendidos,
        reembolsados,
        recaudacion,
      };
    });

    res.status(200).json({ eventos: estadisticas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
};

export default {
  crearEvento,
  obtenerEventos,
  obtenerEventosPorId,
  eliminarEvento,
  cambiarFechaEvento,
  getEstadisticas,
};