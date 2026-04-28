import { z } from "zod";
import { expenseSchema } from "./expenseSchema";

export const updateExpenseSchema = z.object({
  ...expenseSchema.shape,
  id: z.string({ message: "ID inválido" }),
  PK: z.string({ message: "PK inválido" }),
  SK: z.string({ message: "SK inválido" }),
})