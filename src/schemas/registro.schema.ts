import { z } from "zod";

export const crearClienteSchema = z.object({
    body: z.object({
        mail: z.string().email("Email inválido"),
        contraseña: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
        nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
        apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
        tipoDoc: z.string().min(2, "Tipo de documento inválido"),
        nroDoc: z.string().min(7, "Número de documento inválido"),
        fechaNacimiento: z.string().or(z.date()),
        telefono: z.string().optional(),
    }),
});

export const crearOrganizacionSchema = z.object({
    body: z.object({
        mail: z.string().email("Email inválido"),
        contraseña: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
        nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
        cuit: z.string().regex(/^\d{11}$/, "CUIT debe tener 11 dígitos"),
        ubicacion: z.string().min(5, "La ubicación debe ser más descriptiva"),
        eventos: z.array(z.any()).optional(),
    }),
});
