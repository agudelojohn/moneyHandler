import { z } from "zod";

export const householdTaskStatusSchema = z.enum(["pending", "done"]);

export const householdTaskSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  creationDate: z.string().min(1),
  createdBy: z.string().min(1),
  updateDate: z.string().min(1),
  lastUpdatedBy: z.string().min(1),
  doneBy: z.string().nullable(),
  status: householdTaskStatusSchema,
});

export type HouseholdTask = z.infer<typeof householdTaskSchema>;

export const createHouseholdTaskSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "La descripcion es obligatoria")
    .max(200, "Maximo 200 caracteres"),
});

export const patchHouseholdTaskSchema = z
  .object({
    id: z.string().min(1, "ID invalido"),
    description: z
      .string()
      .trim()
      .min(1, "La descripcion es obligatoria")
      .max(200, "Maximo 200 caracteres")
      .optional(),
    status: z.literal("done").optional(),
  })
  .refine((data) => data.description !== undefined || data.status !== undefined, {
    message: "Nada que actualizar",
  });

export const deleteHouseholdTaskSchema = z.object({
  id: z.string().min(1, "ID invalido"),
});
