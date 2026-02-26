import { z } from "zod";

export const actualizarTipoTicketSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID de tipo de ticket inválido"),
    }),
    body: z.object({
        precio: z.number().positive().optional(),
        nombreTipoTicket: z.string().min(2).optional(),
        descripcion: z.string().optional(),
    }).partial(),
});
