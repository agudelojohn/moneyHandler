import { z } from "zod";
import { expenseCategorySchema } from "./common";

export const deleteManagementSchema = z.object({
    category: expenseCategorySchema,
    date: z.iso.datetime({
        message: "Formato de fecha inválido (debe ser ISO 8601)",
    }),
    id: z.string({
        message: "ID inválido",
    }).min(1, "El id es obligatorio"),
});

export type DeleteManagementSchema = z.infer<typeof deleteManagementSchema>;
