import { z } from "zod";
import { managementSchema } from "./managementSchema";
import { deleteManagementSchema } from "./deleteManagementSchema";

export const updateManagementSchema = z
    .object({
        ...deleteManagementSchema.shape,
        deductions: managementSchema.shape.deductions,
        staticPayments: managementSchema.shape.staticPayments.optional(),
        startDate: managementSchema.shape.startDate.optional(),
        endDate: managementSchema.shape.endDate.optional(),
    })
    .refine(
        (data) =>
            (data.startDate === undefined && data.endDate === undefined) ||
            (data.startDate !== undefined && data.endDate !== undefined),
        { message: "startDate y endDate deben enviarse juntos" }
    )
    .refine(
        (data) => {
            if (data.startDate === undefined || data.endDate === undefined) {
                return true;
            }
            return new Date(data.startDate).getTime() <= new Date(data.endDate).getTime();
        },
        {
            message: "La fecha final no puede ser anterior a la fecha inicial",
            path: ["endDate"],
        }
    );

export type UpdateManagementSchema = z.infer<typeof updateManagementSchema>;
