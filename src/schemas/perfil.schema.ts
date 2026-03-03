import { z } from "zod";

export const actualizarClienteSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID de cliente inválido"),
    }),
    body: z.object({
        nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
        apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres").optional(),
        tipoDoc: z.enum(["DNI", "Pasaporte", "Cédula"]).optional(),
        nroDoc: z.string().optional(),
        fechaNacimiento: z.string().or(z.date()).optional(),
        telefono: z.string().regex(/^\+?\d{8,15}$/, "El número de teléfono debe ser válido (8-15 dígitos)").optional().or(z.literal("")),
        mail: z.string().email("Email inválido").optional(),
        contraseña: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional().or(z.literal("")),
    }).superRefine((data, ctx) => {
        if (data.tipoDoc && data.nroDoc) {
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
        }
    }),
});

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

export const actualizarOrganizacionSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID de organización inválido"),
    }),
    body: z.object({
        nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
        cuit: z.string()
            .regex(/^\d{11}$/, "El CUIT debe tener exactamente 11 números")
            .refine(validarCUIT, "CUIT inválido (falló la validación de integridad)")
            .optional(),
        ubicacion: z.string().min(2, "La ubicación debe tener al menos 2 caracteres").optional(),
        mail: z.string().email("Email inválido").optional(),
        contraseña: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional().or(z.literal("")),
    }).partial(),
});

