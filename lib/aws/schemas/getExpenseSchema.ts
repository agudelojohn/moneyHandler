import { z } from "zod";
import { CATEGORIES } from "./common";

export const getExpenseSchema = z.object({
    startDate: z.iso.datetime({
        message: "Formato de fecha inválido (debe ser ISO 8601)",
    }),
    endDate: z.nullish(z.iso.datetime({
        message: "Formato de fecha inválido (debe ser ISO 8601)",
    })),
    category: z.nullish(z.enum(CATEGORIES)),
});

// Extraemos el tipo de TypeScript para usarlo en tus componentes y APIs
export type GetExpenseSchema = z.infer<typeof getExpenseSchema>
