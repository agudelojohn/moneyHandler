import { z } from "zod";

export const deleteExpenseSchema = z.object({
    date: z.iso.datetime({
        message: "Formato de fecha inválido (debe ser ISO 8601)",
    }),
    id: z.string({
        message: "ID inválido",
    }),
});

// Extraemos el tipo de TypeScript para usarlo en tus componentes y APIs
export type DeleteExpenseSchema = z.infer<typeof deleteExpenseSchema>
