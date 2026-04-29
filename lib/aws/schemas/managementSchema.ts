import { z } from "zod";

export const managementSchema = z.object({
    initialAmount: z.number({
        error: "El monto es obligatorio"
    })
        .int("Usa números enteros"),
    creationDate: z.iso.datetime({
        message: "Formato de fecha inválido (debe ser ISO 8601)",
    }),
    deductions: z.array(z.object({
        description: z.string().min(3, "La descripción es muy corta").max(50, "Máximo 50 caracteres"),
        amount: z.number({
            error: "El monto es obligatorio"
        })
            .int("Usa números enteros"),
    })),
});

// Extraemos el tipo de TypeScript para usarlo en tus componentes y APIs
export type Management = z.infer<typeof managementSchema>