import { withUserIdHeader } from "@/app/common/userSession";
import type { CategoryConfig, CategorySwitches } from "../categorySwitches";

const CATEGORY_CONFIG_ENDPOINT = "/api/category-config";

async function parseError(response: Response, fallback: string): Promise<never> {
    const errorData: { error?: string } = await response.json().catch(() => ({}));
    throw new Error(errorData.error ?? fallback);
}

export async function listCategoryConfigs(userId: string): Promise<CategoryConfig[]> {
    const response = await fetch(CATEGORY_CONFIG_ENDPOINT, {
        headers: withUserIdHeader(userId),
    });

    if (!response.ok) {
        await parseError(response, "No se pudo cargar la configuración de categorías");
    }

    const data: unknown = await response.json();
    return Array.isArray(data) ? data as CategoryConfig[] : [];
}

export async function updateCategoryConfig(
    categoryId: string,
    switches: CategorySwitches,
    userId: string,
): Promise<CategoryConfig> {
    const response = await fetch(CATEGORY_CONFIG_ENDPOINT, {
        method: "PUT",
        headers: withUserIdHeader(userId, { "Content-Type": "application/json" }),
        body: JSON.stringify({ categoryId, switches }),
    });

    if (!response.ok) {
        await parseError(response, "No se pudo guardar la configuración de la categoría");
    }

    return response.json();
}
