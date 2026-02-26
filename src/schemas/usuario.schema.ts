import { z } from "zod";

export const loginSchema = z.object({
    body: z.object({
        mail: z.string().email("Email inválido"),
        contraseña: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    }),
});

export const crearUsuarioSchema = z.object({
    body: z.object({
        mail: z.string().email("Email inválido"),
        contraseña: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    }),
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        mail: z.string().email("Email inválido"),
    }),
});

export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(1, "Token es requerido"),
        nuevaContraseña: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
    }),
});
