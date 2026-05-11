import { z } from "zod";
import { managementSchema } from "./managementSchema";
import { deleteManagementSchema } from "./deleteManagementSchema";

export const updateManagementSchema = z.object({
    ...deleteManagementSchema.shape,
    deductions: managementSchema.shape.deductions,
    staticPayments: managementSchema.shape.staticPayments.optional(),
});

export type UpdateManagementSchema = z.infer<typeof updateManagementSchema>;
