import { z } from "zod";
import { expenseCategorySchema } from "./common";

const isoDatetimeField = z.iso.datetime({
    message: "Formato de fecha inválido (debe ser ISO 8601)",
});

export const deductionEntrySchema = z.object({
    description: z.string().min(3, "La descripción es muy corta").max(50, "Máximo 50 caracteres"),
    amount: z.number({
        error: "El monto es obligatorio"
    })
        .int("Usa números enteros"),
    isCredit: z.boolean({
        error: "El indicador de credito es obligatorio"
    }),
    isPayed: z.boolean({
        error: "El indicador de pagado es obligatorio"
    }),
});

export const staticPaymentEntrySchema = deductionEntrySchema.extend({
    paymentDay: isoDatetimeField.nullable(),
});

export const managementSchema = z
    .object({
        category: expenseCategorySchema,
        initialAmount: z.number({
            error: "El monto es obligatorio"
        })
            .int("Usa números enteros"),
        creationDate: isoDatetimeField,
        startDate: z.iso.datetime({
            message: "Formato de fecha inicial inválido (debe ser ISO 8601)",
        }),
        endDate: z.iso.datetime({
            message: "Formato de fecha final inválido (debe ser ISO 8601)",
        }),
        deductions: z.array(deductionEntrySchema),
        staticPayments: z.array(staticPaymentEntrySchema),
    })
    .refine(
        (data) => new Date(data.startDate).getTime() <= new Date(data.endDate).getTime(),
        {
            message: "La fecha final no puede ser anterior a la fecha inicial",
            path: ["endDate"],
        }
    );

// Extraemos el tipo de TypeScript para usarlo en tus componentes y APIs
export type Management = z.infer<typeof managementSchema>;
