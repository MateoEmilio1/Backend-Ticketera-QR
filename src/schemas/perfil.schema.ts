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
        telefono: z.string().optional(),
        mail: z.string().email("Email inválido").optional(),
        contraseña: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional().or(z.literal("")),
    }).partial(),
});

export const actualizarOrganizacionSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID de organización inválido"),
    }),
    body: z.object({
        nombre: z.string().min(2).optional(),
        cuit: z.string().optional(),
        ubicacion: z.string().optional(),
        mail: z.string().email("Email inválido").optional(),
        contraseña: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional().or(z.literal("")),
    }).partial(),
});

