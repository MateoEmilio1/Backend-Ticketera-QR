import { z } from "zod";

export const idParamSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID inválido"),
    }),
});

export const idClienteParamSchema = z.object({
    params: z.object({
        idCliente: z.string().regex(/^\d+$/, "ID de cliente inválido"),
    }),
});
