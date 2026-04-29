import { z } from "zod";

export const getManagementSchema = z.object({
    month: z.coerce
        .number({
            error: "El mes es obligatorio",
        })
        .int("El mes debe ser un número entero")
        .min(1, "El mes debe estar entre 1 y 12")
        .max(12, "El mes debe estar entre 1 y 12"),
    year: z.nullish(
        z.coerce
            .number({
                error: "El año es inválido",
            })
            .int("El año debe ser un número entero")
    ),
});

export type GetManagementSchema = z.infer<typeof getManagementSchema>;
