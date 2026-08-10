import { z } from "zod";
import { categoryIdSchema } from "./common";

const categoryNameSchema = z
    .string({ error: "El nombre es obligatorio" })
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(30, "Máximo 30 caracteres");

export const createCategorySchema = z.object({
    name: categoryNameSchema,
});

export const updateCategorySchema = z.object({
    id: categoryIdSchema,
    name: categoryNameSchema,
});

export const deleteCategorySchema = z.object({
    id: categoryIdSchema,
});

export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;
export type DeleteCategorySchema = z.infer<typeof deleteCategorySchema>;

/** Estado del ciclo de vida de una categoría. El borrado es lógico (soft delete). */
export type CategoryStatus = "active" | "deleted";

/** Item de categoría tal como se persiste/expone (sin las claves PK/SK internas). */
export type UserCategory = {
    id: string;
    name: string;
    status: CategoryStatus;
    isLocked: boolean;
    isDefault: boolean;
    createdAt: string;
};
