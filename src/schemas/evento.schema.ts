import { z } from "zod";

const tipoTicketSchema = z.object({
    tipo: z.string().min(1, "Tipo de ticket es requerido"),
    precio: z.number().positive("El precio debe ser un número positivo"),
    acceso: z.string().min(1, "El acceso es requerido"),
    cantMaxPorTipo: z.number().int().positive("La cantidad máxima debe ser un número entero positivo"),
});

export const crearEventoSchema = z.object({
    body: z.object({
        nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
        fechaCreacion: z.string().or(z.date()),
        fechaHoraEvento: z.string().or(z.date()),
        capacidadMax: z.number().int().positive("La capacidad máxima debe ser un número entero positivo"),
        descripcion: z.string().optional(),
        foto: z.string().url("La foto debe ser una URL válida"),
        idCategoria: z.number().int().positive("ID de categoría inválido"),
        idOrganizacion: z.number().int().positive("ID de organización inválido"),
        tipoTickets: z.array(tipoTicketSchema).min(1, "Debe incluir al menos un tipo de ticket"),
    }),
});

export const cambiarFechaEventoSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID de evento inválido"),
    }),
    body: z.object({
        fechaHoraEvento: z.string().or(z.date()).refine(
            (val) => {
                const date = new Date(val);
                if (isNaN(date.getTime())) return false;

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date >= today;
            },
            { message: "La fecha del evento no puede ser previa al día de hoy" }
        ),
    }),
});
