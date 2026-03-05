import { prisma } from "../prisma.js";
import { Request, Response } from "express";
import { sendEventCancellationEmail, sendEventDateChangeEmail } from "../services/emailService.js";

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
    console.error("Error al crear el evento:", error);
    res.status(500).json({ message: "Error interno del servidor", error: true });
  }
};

// Obtener todos los eventos
const obtenerEventos = async (req: Request, res: Response) => {
  try {
    const { idOrganizacion } = req.query;

    const whereClause: any = {};

    if (idOrganizacion && !isNaN(Number(idOrganizacion))) {
      whereClause.idOrganizacion = Number(idOrganizacion);
    }

    const eventos = await prisma.evento.findMany({
      where: whereClause,
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

// Cambiar fecha de evento
const cambiarFechaEvento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { fechaHoraEvento } = req.body;
    const idEvento = parseInt(id);

    // 1. Obtener el evento para verificar que existe, incluyendo tickets y clientes para notificar
    const eventoAntiguo = await prisma.evento.findUnique({
      where: { idEvento },
      include: {
        tipoTickets: {
          include: {
            tickets: {
              where: { estado: 'pagado' },
              include: {
                cliente: {
                  include: { usuario: true }
                }
              }
            }
          }
        }
      }
    });

    if (!eventoAntiguo) {
      res.status(404).json({ message: "Evento no encontrado", error: true });
      return;
    }

    const nuevaFecha = new Date(fechaHoraEvento);

    // 2. Actualizar la fecha del evento
    const eventoActualizado = await prisma.evento.update({
      where: { idEvento },
      data: {
        fechaHoraEvento: nuevaFecha
      },
    });

    // 3. Enviar notificaciones de manera asíncrona
    const ticketsPorNotificar = eventoAntiguo.tipoTickets.flatMap(tt => tt.tickets);

    Promise.allSettled(ticketsPorNotificar.map(ticket => {
      const email = ticket.cliente.usuario.mail;
      const nombreUsuario = `${ticket.cliente.nombre} ${ticket.cliente.apellido}`;

      // Obtener formato de fechas
      const fechaAntiguaStr = eventoAntiguo.fechaHoraEvento.toLocaleString('es-AR');
      const fechaNuevaStr = nuevaFecha.toLocaleString('es-AR');

      return sendEventDateChangeEmail(email, {
        evento: eventoAntiguo.nombre,
        fechaAntigua: fechaAntiguaStr,
        fechaNueva: fechaNuevaStr,
        usuario: nombreUsuario
      });
    })).then(results => {
      const exitosos = results.filter(r => r.status === 'fulfilled').length;
      console.log(`Notificaciones de cambio de fecha enviadas: ${exitosos}/${ticketsPorNotificar.length}`);
    });

    res.status(200).json({ message: "Fecha de evento actualizada con éxito", data: eventoActualizado, error: false });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la fecha del Evento", error: true, details: (error as Error).message });
  }
};


// Obtener estadísticas
const getEstadisticas = async (req: Request, res: Response) => {
  try {
    const { fechaInicio, fechaFin, idOrganizacion } = req.query;

    const whereClause: any = {};
    if (idOrganizacion) {
      whereClause.idOrganizacion = Number(idOrganizacion);
    }
    if (fechaInicio || fechaFin) {
      whereClause.fechaHoraEvento = {};
      if (fechaInicio) whereClause.fechaHoraEvento.gte = new Date(fechaInicio as string);
      if (fechaFin) whereClause.fechaHoraEvento.lte = new Date(fechaFin as string);
    }

    // Traer todos los eventos filtrados por fecha con tickets y clientes
    const eventos = await prisma.evento.findMany({
      where: whereClause,
      include: {
        tipoTickets: {
          include: { tickets: { include: { cliente: true } } },
        },
      },
    });

    // Procesar estadísticas por evento
    const estadisticas = eventos.map((evento) => {
      // Traer todos los tickets relevantes (excluyendo pendientes)
      const allTickets = evento.tipoTickets.flatMap((t) => t.tickets).filter(t => t.estado !== "pendiente");

      // Contar como vendidos solo los que están pagados o consumidos
      const ticketsActivos = allTickets.filter(t => t.estado === "pagado" || t.estado === "consumido");
      const vendidos = ticketsActivos.length;

      // Contar específicamente los reembolsados
      const reembolsados = allTickets.filter((t) => t.estado === "reembolsado").length;

      // Calcular recaudación solo de tickets activos
      const recaudacion = ticketsActivos.reduce(
        (sum, t) => {
          const precio = Number(evento.tipoTickets.find((tt) => tt.idTipoTicket === t.idTipoTicket)?.precio || 0);
          return sum + precio;
        },
        0
      );

      // Usar tickets activos para el perfil demográfico (edad)
      const edades = ticketsActivos
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
    const { fechaInicio, fechaFin, idCategoria, idTipoTicket, idEvento, idOrganizacion } = req.query;

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

    // Filtros por Categoria, Evento y Organizacion (Merge relationship filters)
    if (idCategoria || idEvento || idOrganizacion) {
      whereClause.tipoTicket = {
        evento: {}
      };

      if (idCategoria) {
        whereClause.tipoTicket.evento.idCategoria = Number(idCategoria);
      }
      if (idEvento) {
        whereClause.tipoTicket.evento.idEvento = Number(idEvento);
      }
      if (idOrganizacion) {
        whereClause.tipoTicket.evento.idOrganizacion = Number(idOrganizacion);
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

// Reporte de Eventos por Categoría (CU12)
const getEventosPorCategoria = async (req: Request, res: Response) => {
  try {
    const { idOrganizacion } = req.query;
    const orgFilter = idOrganizacion ? { idOrganizacion: Number(idOrganizacion) } : {};

    const categorias = await prisma.categoria.findMany({
      include: {
        eventos: {
          where: orgFilter,
          include: {
            tipoTickets: {
              include: {
                _count: {
                  select: {
                    tickets: {
                      where: { estado: { in: ['pagado', 'consumido'] } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const reporte = categorias.map(cat => ({
      idCategoria: cat.idCategoria,
      nombre: cat.nombreCategoria,
      cantidadEventos: cat.eventos.length,
      ticketsVendidos: cat.eventos.reduce((total, e) => total + e.tipoTickets.reduce((sum, tt) => sum + tt._count.tickets, 0), 0),
      recaudacionTotal: cat.eventos.reduce((total, e) => total + e.tipoTickets.reduce((sum, tt) => sum + (tt._count.tickets * Number(tt.precio)), 0), 0),
      eventos: cat.eventos.map(e => ({
        idEvento: e.idEvento,
        nombre: e.nombre,
        fecha: e.fechaHoraEvento,
        ticketsVendidos: e.tipoTickets.reduce((sum, tt) => sum + tt._count.tickets, 0),
        recaudacionTotal: e.tipoTickets.reduce((sum, tt) => sum + (tt._count.tickets * Number(tt.precio)), 0)
      }))
    })).filter(cat => cat.cantidadEventos > 0);

    res.status(200).json({
      message: "Reporte de eventos por categoría obtenido con éxito",
      data: reporte,
      error: false
    });
  } catch (error) {
    console.error("Error en getEventosPorCategoria:", error);
    res.status(500).json({
      message: "Error al generar el reporte",
      error: true
    });
  }
};

// Cancelar un evento
const cancelarEvento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const idEvento = parseInt(id);

    // 1. Obtener el evento para verificar que existe, incluyendo tickets y clientes para notificar
    const evento = await prisma.evento.findUnique({
      where: { idEvento },
      include: {
        tipoTickets: {
          include: {
            tickets: {
              where: { estado: 'pagado' }, // Solo los que están pagados necesitan notificación de reembolso
              include: {
                cliente: {
                  include: { usuario: true }
                }
              }
            }
          }
        }
      }
    });

    if (!evento) {
      res.status(404).json({ message: "Evento no encontrado", error: true });
      return;
    }

    // 2. Transacción para actualizar el estado del evento y sus tickets
    await prisma.$transaction(async (tx) => {
      // Actualizar estado del evento
      await tx.evento.update({
        where: { idEvento },
        data: { estado: 'CANCELADO' }
      });

      // Actualizar todos los tickets pagados a reembolsado
      const tipoTicketIds = evento.tipoTickets.map(tt => tt.idTipoTicket);
      await tx.ticket.updateMany({
        where: {
          idTipoTicket: { in: tipoTicketIds },
          estado: 'pagado'
        },
        data: { estado: 'reembolsado' }
      });
    });

    // 3. Enviar notificaciones de manera asíncrona (sin bloquear la respuesta)
    const ticketsPorNotificar = evento.tipoTickets.flatMap(tt => tt.tickets);

    // Usamos Promise.allSettled por si alguno falla, no afecte al resto
    Promise.allSettled(ticketsPorNotificar.map(ticket => {
      const email = ticket.cliente.usuario.mail;
      const nombreUsuario = `${ticket.cliente.nombre} ${ticket.cliente.apellido}`;
      const fechaEvento = evento.fechaHoraEvento.toLocaleDateString();

      return sendEventCancellationEmail(email, {
        evento: evento.nombre,
        fecha: fechaEvento,
        usuario: nombreUsuario
      });
    })).then(results => {
      const exitosos = results.filter(r => r.status === 'fulfilled').length;
      console.log(`Notificaciones enviadas: ${exitosos}/${ticketsPorNotificar.length}`);
    });

    res.status(200).json({ message: "Evento cancelado con éxito y tickets reembolsados", error: false });
  } catch (error) {
    console.error("Error al cancelar evento:", error);
    res.status(500).json({ message: "Error al cancelar el evento", error: true, details: (error as Error).message });
  }
};

export default {
  crearEvento,
  obtenerEventos,
  obtenerEventosPorId,
  eliminarEvento,
  cambiarFechaEvento,
  cancelarEvento,
  getEstadisticas,
  getVentasPorHora,
  getEventosPorCategoria,
};
