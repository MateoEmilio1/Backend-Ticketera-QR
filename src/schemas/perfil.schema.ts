import { z } from "zod";

export const actualizarClienteSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID de cliente inválido"),
    }),
    body: z.object({
        nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
        apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres").optional(),
        tipoDoc: z.string().optional(),
        nroDoc: z.string().regex(/^\d{7,11}$/, "El número de documento debe contener entre 7 y 11 dígitos numéricos").optional(),
        fechaNacimiento: z.string().or(z.date()).optional(),
        telefono: z.string().regex(/^\+?\d{8,15}$/, "El número de teléfono debe ser válido (8-15 dígitos)").optional().or(z.literal("")),
        mail: z.string().email("Email inválido").optional(),
        contraseña: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional().or(z.literal("")),
    }).partial(),
});

export const actualizarOrganizacionSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID de organización inválido"),
    }),
    body: z.object({
        nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
        cuit: z.string().regex(/^\d{11}$/, "El CUIT debe tener exactamente 11 números").optional(),
        ubicacion: z.string().min(2, "La ubicación debe tener al menos 2 caracteres").optional(),
        mail: z.string().email("Email inválido").optional(),
        contraseña: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional().or(z.literal("")),
    }).partial(),
});

