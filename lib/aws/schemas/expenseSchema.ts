import { z } from "zod";
import { CATEGORIES } from "./common";

export const expenseSchema = z.object({
    // El monto lo manejamos como entero (centavos) para evitar errores de punto flotante
    amount: z
        .number({
            error: "El monto es obligatorio"
        })
        .int("Usa números enteros")
        .positive("El gasto debe ser mayor a 0"),

    description: z
        .string()
        .min(3, "La descripción es muy corta")
        .max(50, "Máximo 50 caracteres"),

    // Validamos que sea una fecha ISO 8601 válida
    date: z.iso.datetime({
        message: "Formato de fecha inválido (debe ser ISO 8601)",
    }),

    category: z.enum(CATEGORIES, {
        error: "Selecciona una categoría válida"
    }),

    // Opcional: ID de usuario si lo manejas desde el body (si no, se saca de la sesión)
    userId: z.nullable(z.optional(z.string().uuid())),
});

// Extraemos el tipo de TypeScript para usarlo en tus componentes y APIs
export type Expense = z.infer<typeof expenseSchema>