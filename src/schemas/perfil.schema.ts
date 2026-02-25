import { z } from "zod";

export const actualizarClienteSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID de cliente inválido"),
    }),
    body: z.object({
        nombre: z.string().min(2).optional(),
        apellido: z.string().min(2).optional(),
        tipoDoc: z.string().optional(),
        nroDoc: z.string().optional(),
        fechaNacimiento: z.string().or(z.date()).optional(),
    }).partial(),
});

export const actualizarOrganizacionSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID de organización inválido"),
    }),
    body: z.object({
        nombre: z.string().min(2).optional(),
        cuit: z.string().optional(),
        direccion: z.string().optional(),
        telefono: z.string().optional(),
    }).partial(),
});
