import { z } from "zod";

export const categorySwitchesSchema = z.object({
    dailyConfiguration: z.boolean(),
});

export type CategorySwitches = z.infer<typeof categorySwitchesSchema>;

export const CATEGORY_SWITCH_KEYS = ["dailyConfiguration"] as const satisfies ReadonlyArray<keyof CategorySwitches>;

export type CategorySwitchKey = (typeof CATEGORY_SWITCH_KEYS)[number];

/** Sin fila guardada, o con una clave que no es booleana, todos los switches nacen apagados. */
export function defaultCategorySwitches(categoryId: string): CategorySwitches {
    void categoryId;
    return {
        dailyConfiguration: false,
    };
}

export type CategoryConfig = {
    categoryId: string;
    switches: CategorySwitches;
    updatedAt: string | null;
};

export function normalizeCategorySwitches(categoryId: string, raw: unknown): CategorySwitches {
    const defaults = defaultCategorySwitches(categoryId);
    if (!raw || typeof raw !== "object") {
        return defaults;
    }

    const record = raw as Record<string, unknown>;
    return {
        dailyConfiguration: typeof record.dailyConfiguration === "boolean"
            ? record.dailyConfiguration
            : defaults.dailyConfiguration,
    };
}
