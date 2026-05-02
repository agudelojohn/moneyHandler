import { z } from "zod";

export const CATEGORIES = ["Gastos", "Gatitos", "Mercado", "Otros", "Servicios"] as const;

export type ExpenseCategory = (typeof CATEGORIES)[number];

export const expenseCategorySchema = z.enum(
  CATEGORIES as unknown as [ExpenseCategory, ...ExpenseCategory[]]
);

export function isExpenseCategory(value: string): value is ExpenseCategory {
  return (CATEGORIES as readonly string[]).includes(value);
}
