import { z } from "zod";
import { categoryIdSchema } from "./common";
import { categorySwitchesSchema } from "@/app/management/categorySwitches";

export const updateCategoryConfigSchema = z.object({
    categoryId: categoryIdSchema,
    switches: categorySwitchesSchema,
});

export type UpdateCategoryConfigSchema = z.infer<typeof updateCategoryConfigSchema>;
