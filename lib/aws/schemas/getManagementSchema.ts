import { z } from "zod";

export const getManagementSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD"),
});

export type GetManagementSchema = z.infer<typeof getManagementSchema>;
