import { z } from "zod";

const validarCUIT = (cuit: string): boolean => {
    cuit = cuit.replace(/[-_]/g, "");
    if (cuit.length !== 11 || !/^\d+$/.test(cuit)) return false;
    const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cuit[i]) * multipliers[i];
    }
    let calculatedCheck = 11 - (sum % 11);
    if (calculatedCheck === 11) calculatedCheck = 0;
    if (calculatedCheck === 10) calculatedCheck = 9;
    return parseInt(cuit[10]) === calculatedCheck;
};

export const crearClienteSchema = z.object({
    body: z.object({
        mail: z.string().email("Email inválido"),
        contraseña: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
        nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
        apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
        tipoDoc: z.enum(["DNI", "Pasaporte", "Cédula"]),
        nroDoc: z.string(),
        fechaNacimiento: z.string().or(z.date()),
        telefono: z.string().regex(/^\+?\d{8,15}$/, "Número de teléfono inválido (8-15 dígitos)").optional(),
        repetirContraseña: z.string().optional(),
    }).superRefine((data, ctx) => {
        if (data.contraseña !== data.repetirContraseña) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Las contraseñas no coinciden",
                path: ["repetirContraseña"],
            });
        }
        if (data.tipoDoc === "DNI") {
            if (!/^\d{7,9}$/.test(data.nroDoc)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "DNI debe tener entre 7 y 9 dígitos numéricos",
                    path: ["nroDoc"],
                });
            }
        } else if (data.tipoDoc === "Pasaporte") {
            if (!/^[a-zA-Z0-9]{5,20}$/.test(data.nroDoc)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Pasaporte debe ser alfanumérico entre 5 y 20 caracteres",
                    path: ["nroDoc"],
                });
            }
        } else if (data.tipoDoc === "Cédula") {
            if (!/^[a-zA-Z0-9]{5,15}$/.test(data.nroDoc)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Cédula debe ser alfanumérica entre 5 y 15 caracteres",
                    path: ["nroDoc"],
                });
            }
        }
    }),
});

export const crearOrganizacionSchema = z.object({
    body: z.object({
        mail: z.string().email("Email inválido"),
        contraseña: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
        nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
        cuit: z.string()
            .regex(/^\d{11}$/, "CUIT debe tener 11 dígitos")
            .refine(validarCUIT, "CUIT inválido (falló la validación de integridad)"),
        ubicacion: z.string().min(5, "La ubicación debe ser más descriptiva"),
        eventos: z.array(z.any()).optional(),
        repetirContraseña: z.string().optional(),
    }).superRefine((data, ctx) => {
        if (data.contraseña !== data.repetirContraseña) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Las contraseñas no coinciden",
                path: ["repetirContraseña"],
            });
        }
    }),
});
