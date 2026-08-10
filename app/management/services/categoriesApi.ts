import { withUserIdHeader } from "@/app/common/userSession";
import type { UserCategory } from "@/lib/aws/schemas/categorySchema";

const CATEGORIES_ENDPOINT = "/api/categories";

async function parseError(response: Response, fallback: string): Promise<never> {
    const errorData: { error?: string } = await response.json().catch(() => ({}));
    throw new Error(errorData.error ?? fallback);
}

export async function listCategories(userId: string): Promise<UserCategory[]> {
    const response = await fetch(CATEGORIES_ENDPOINT, {
        headers: withUserIdHeader(userId),
    });

    if (!response.ok) {
        await parseError(response, "No se pudieron cargar las categorías");
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
}

export async function createCategory(name: string, userId: string): Promise<UserCategory> {
    const response = await fetch(CATEGORIES_ENDPOINT, {
        method: "POST",
        headers: withUserIdHeader(userId, { "Content-Type": "application/json" }),
        body: JSON.stringify({ name }),
    });

    if (!response.ok) {
        await parseError(response, "No se pudo crear la categoría");
    }

    return response.json();
}

export async function renameCategory(id: string, name: string, userId: string): Promise<UserCategory> {
    const response = await fetch(CATEGORIES_ENDPOINT, {
        method: "PUT",
        headers: withUserIdHeader(userId, { "Content-Type": "application/json" }),
        body: JSON.stringify({ id, name }),
    });

    if (!response.ok) {
        await parseError(response, "No se pudo renombrar la categoría");
    }

    return response.json();
}

export async function deleteCategory(id: string, userId: string): Promise<void> {
    const response = await fetch(`${CATEGORIES_ENDPOINT}?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: withUserIdHeader(userId),
    });

    if (!response.ok) {
        await parseError(response, "No se pudo eliminar la categoría");
    }
}
