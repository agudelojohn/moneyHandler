import { z } from "zod";

/**
 * Antes las categorías eran un enum fijo de nombres. Ahora son dinámicas por
 * usuario (ver `lib/aws/categories.ts` y `app/api/categories/route.ts`): cada
 * categoría tiene un `id` estable y los registros la referencian por ese `id`.
 *
 * Los valores de abajo solo se usan como SEMILLA (seed) para usuarios que aún no
 * tienen categorías propias. Sus `id` se fijan al nombre canónico en MAYÚSCULAS
 * para que coincidan con las claves (SK) de los registros históricos de gestión
 * (`ADDITION#GASTOS#...`) y con el fallback de gastos legacy.
 */

/** Id de la categoría "Gastos": única bloqueada y con cálculo prorrateado por días. */
export const EXPENSES_CATEGORY_ID = "GASTOS";

export type DefaultCategory = {
  id: string;
  name: string;
  isLocked: boolean;
};

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { id: EXPENSES_CATEGORY_ID, name: "Gastos", isLocked: true },
  { id: "GATITOS", name: "Gatitos", isLocked: false },
  { id: "MERCADO", name: "Mercado", isLocked: false },
  { id: "OTROS", name: "Otros", isLocked: false },
  { id: "SERVICIOS", name: "Servicios", isLocked: false },
];

/** Validación del id de categoría (antes era `z.enum(CATEGORIES)`). */
export const categoryIdSchema = z
  .string({ error: "Selecciona una categoría válida" })
  .trim()
  .min(1, "Selecciona una categoría válida");

/**
 * El id de la categoría es un string dinámico. Se conservan estos alias por
 * compatibilidad con el código existente que aún tipa `ExpenseCategory` /
 * `expenseCategorySchema`; ya no son un enum literal.
 */
export type CategoryId = string;
export type ExpenseCategory = CategoryId;
export const expenseCategorySchema = categoryIdSchema;
