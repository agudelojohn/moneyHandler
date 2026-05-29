import { z } from "zod";
import { expenseCategorySchema } from "./common";

export const getManagementSchema = z.object({
    date: z.iso.datetime({
        message: "Formato de fecha inválido (debe ser ISO 8601 UTC)",
    }),
    category: expenseCategorySchema,
});

export type GetManagementSchema = z.infer<typeof getManagementSchema>;
