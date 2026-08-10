import { z } from "zod";
import { categoryIdSchema } from "./common";

export const getExpenseSchema = z.object({
    startDate: z.iso.datetime({
        message: "Formato de fecha inválido (debe ser ISO 8601)",
    }),
    endDate: z.nullish(z.iso.datetime({
        message: "Formato de fecha inválido (debe ser ISO 8601)",
    })),
    categoryId: z.nullish(categoryIdSchema),
});

// Extraemos el tipo de TypeScript para usarlo en tus componentes y APIs
export type GetExpenseSchema = z.infer<typeof getExpenseSchema>
