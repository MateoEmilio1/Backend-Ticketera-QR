import { prisma } from "../prisma.js";
import { Request, Response } from "express";

// Crear un Evento
const crearEvento = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      nombre,
      fechaCreacion,
      fechaHoraEvento,
      capacidadMax,
      descripcion,
      foto,
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
        foto,
        categoria: { connect: { idCategoria } },
        organizacion: { connect: { idOrganizacion } },
        tipoTickets: {
          create: tipoTickets.map((ticket: { tipo: any; precio: any; acceso: any; cantMaxPorTipo: any; }) => ({
            tipo: ticket.tipo,
            precio: ticket.precio,
            acceso: ticket.acceso,
            cantMaxPorTipo: ticket.cantMaxPorTipo,
          })),
        },
      },
      include: { tipoTickets: true },
    });

    res.status(201).json({ message: "Evento creado con éxito", evento });
  } catch (error) {
    console.error("Error al crear el evento:", error);
    res.status(500).json({ message: "Error interno del servidor", error: true });
  }
};

// Obtener todos los eventos
const obtenerEventos = async (req: Request, res: Response) => {
  try {
    const eventos = await prisma.evento.findMany({
      include: { tipoTickets: true },
    });

    res.status(200).json({ message: "Eventos obtenidos con éxito", data: eventos, error: false });
  } catch (error) {
    console.error("Error en obtenerEventos:", error);
    res.status(500).json({ message: "Error al obtener los eventos", error: true, details: (error as Error).message });
  }
};

// Obtener un evento por id
const obtenerEventosPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const evento = await prisma.evento.findUnique({
      where: { idEvento: parseInt(id) },
      include: { tipoTickets: true },
    });

    if (!evento) {
      res.status(404).json({ message: "Evento no encontrado", error: true });
      return;
    }

    res.status(200).json({ message: "Evento obtenido con éxito", data: evento, error: false });
  } catch (error) {
    console.error("Error en obtenerEventoPorId:", error);
    res.status(500).json({ message: "Error al obtener el evento", error: true, details: (error as Error).message });
  }
};

// Eliminar evento
const eliminarEvento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const eventoEliminado = await prisma.evento.delete({
      where: { idEvento: parseInt(id) },
    });

    if (!eventoEliminado) {
      res.status(404).json({ message: "Evento no encontrado", error: true });
      return;
    }

    res.status(200).json({ message: "Evento eliminado con éxito", error: false });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el Evento", error: true, details: (error as Error).message });
  }
};

// Actualizar evento
const actualizarEvento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const EventoData = req.body;
    const EventoActualizado = await prisma.evento.update({
      where: { idEvento: parseInt(id) },
      data: EventoData,
    });

    res.status(200).json({ message: "Evento actualizado con éxito", data: EventoActualizado, error: false });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el Evento", error: true, details: (error as Error).message });
  }
};

const cancelarEvento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const evento = await prisma.evento.findUnique({
      where: { idEvento: parseInt(id) },
    });

    if (!evento) {
      return res.status(404).json({ message: "Evento no encontrado", error: true });
    }

    // Como el modelo no tiene campo 'estado', actualizamos la descripción
    await prisma.evento.update({
      where: { idEvento: parseInt(id) },
      data: {
        descripcion: `[CANCELADO] ${motivo || ''} - ${evento.descripcion}`
      }
    });

    res.status(200).json({
      message: "Evento cancelado con éxito",
      error: false
    });
  } catch (error) {
    console.error("Error en cancelarEvento:", error);
    res.status(500).json({ message: "Error al cancelar el evento", error: true });
  }
};

// Obtener estadísticas
const getEstadisticas = async (req: Request, res: Response) => {
  try {
    // Traer todos los eventos con tickets y clientes
    const eventos = await prisma.evento.findMany({
      include: {
        tipoTickets: {
          include: { tickets: { include: { cliente: true } } },
        },
      },
    });

    // Procesar estadísticas por evento
    const estadisticas = eventos.map((evento) => {
      const tickets = evento.tipoTickets.flatMap((t) => t.tickets);
      const vendidos = tickets.length;
      const reembolsados = tickets.filter((t) => t.estado === "reembolsado").length;
      const recaudacion = tickets.reduce(
        (sum, t) =>
          sum +
          Number(evento.tipoTickets.find((tt) => tt.idTipoTicket === t.idTipoTicket)?.precio || 0),
        0
      );

      const edades = tickets
        .map((t) => {
          if (!t.cliente?.fechaNacimiento) return NaN;
          const hoy = new Date();
          const nacimiento = new Date(t.cliente.fechaNacimiento);
          return hoy.getFullYear() - nacimiento.getFullYear();
        })
        .filter((edad) => !isNaN(edad));

      return {
        idEvento: evento.idEvento,
        nombre: evento.nombre,
        foto: evento.foto,
        fecha: evento.fechaHoraEvento,
        vendidos,
        reembolsados,
        porcReembolsados: vendidos ? (reembolsados / vendidos) * 100 : 0,
        recaudacion,
        edadPromedio: edades.length
          ? edades.reduce((a, b) => a + b, 0) / edades.length
          : 0,
      };
    });

    // Resumen general
    const totalVendidos = estadisticas.reduce((a, e) => a + e.vendidos, 0);
    const totalReembolsados = estadisticas.reduce((a, e) => a + e.reembolsados, 0);
    const totalRecaudacion = estadisticas.reduce((a, e) => a + e.recaudacion, 0);

    const resumen = {
      totalVendidos,
      promedioVendidos: estadisticas.length ? totalVendidos / estadisticas.length : 0,
      totalReembolsados,
      porcReembolsados: totalVendidos ? (totalReembolsados / totalVendidos) * 100 : 0,
      recaudacionTotal: totalRecaudacion,
      recaudacionPromedio: estadisticas.length ? totalRecaudacion / estadisticas.length : 0,
    };

    res.status(200).json({ resumen, eventos: estadisticas });
  } catch (error) {
    console.error("Error en getEstadisticas:", error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
};

// Reporte de Ventas por Hora
const getVentasPorHora = async (req: Request, res: Response) => {
  try {
    const { fechaInicio, fechaFin, idCategoria, idTipoTicket, idEvento } = req.query;

    const whereClause: any = {
      estado: { in: ['pagado', 'consumido'] } // Solo ventas reales
    };

    // Filtros de fecha
    if (fechaInicio || fechaFin) {
      whereClause.fechaCreacion = {};
      if (fechaInicio) whereClause.fechaCreacion.gte = new Date(fechaInicio as string);
      if (fechaFin) whereClause.fechaCreacion.lte = new Date(fechaFin as string);
    }

    // Filtros por Tipo de Ticket
    if (idTipoTicket) {
      whereClause.idTipoTicket = Number(idTipoTicket);
    }

    // Filtros por Categoria y Evento (Merge relationship filters)
    if (idCategoria || idEvento) {
      whereClause.tipoTicket = {
        evento: {}
      };

      if (idCategoria) {
        whereClause.tipoTicket.evento.idCategoria = Number(idCategoria);
      }
      if (idEvento) {
        whereClause.tipoTicket.evento.idEvento = Number(idEvento);
      }
    }
    // Obtenemos los tickets
    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      select: {
        nroTicket: true,
        fechaCreacion: true,
        tipoTicket: {
          select: { precio: true }
        }
      }
    });

    console.log(`[Reporte Ventas] Tickets encontrados: ${tickets.length}`);

    // Inicializar array de 24 horas
    const ventasPorHora = Array.from({ length: 24 }, (_, i) => ({
      hora: `${i}:00`,
      cantidad: 0,
      recaudacion: 0
    }));

    // Procesar datos
    tickets.forEach(ticket => {
      const fecha = new Date(ticket.fechaCreacion);
      const hora = fecha.getHours(); // 0-23
      console.log(`Ticket #${ticket.nroTicket} - Fecha: ${ticket.fechaCreacion} - Hora detectada: ${hora}`);

      if (hora >= 0 && hora < 24) {
        ventasPorHora[hora].cantidad += 1;
        ventasPorHora[hora].recaudacion += Number(ticket.tipoTicket.precio);
      }
    });

    res.status(200).json({
      message: "Reporte de ventas por hora obtenido con éxito",
      data: ventasPorHora,
      error: false
    });

  } catch (error) {
    console.error("Error en getVentasPorHora:", error);
    res.status(500).json({
      message: "Error al generar el reporte",
      error: true,
      details: (error as Error).message
    });
  }
};

export default {
  crearEvento,
  obtenerEventos,
  obtenerEventosPorId,
  eliminarEvento,
  actualizarEvento,
  cancelarEvento,
  getEstadisticas,
  getVentasPorHora,
};

