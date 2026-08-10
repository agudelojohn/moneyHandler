import { z } from "zod";
import { categoryIdSchema } from "./common";

export const getManagementSchema = z.object({
    date: z.iso.datetime({
        message: "Formato de fecha inválido (debe ser ISO 8601 UTC)",
    }),
    categoryId: categoryIdSchema,
});

export type GetManagementSchema = z.infer<typeof getManagementSchema>;
