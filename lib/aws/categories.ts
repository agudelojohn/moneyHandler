import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { db, TABLE_NAME } from "./dynamo";
import { DEFAULT_CATEGORIES } from "./schemas/common";
import type { UserCategory } from "./schemas/categorySchema";

export const buildCategoryPK = (userId: string) => `CATEGORY#${userId}`;
export const buildCategorySK = (id: string) => `CATEGORY#${id}`;

type RawCategoryItem = Record<string, unknown>;

/** Normaliza un item crudo de DynamoDB a la forma pública `UserCategory`. */
function toUserCategory(item: RawCategoryItem): UserCategory {
    return {
        id: String(item.id),
        name: String(item.name),
        status: item.status === "deleted" ? "deleted" : "active",
        isLocked: Boolean(item.isLocked),
        isDefault: Boolean(item.isDefault),
        createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date(0).toISOString(),
    };
}

/**
 * Escribe las categorías por defecto para un usuario que aún no tiene ninguna.
 * Los `id` se fijan al nombre canónico en MAYÚSCULAS para mantener compatibilidad
 * con los registros históricos (ver `lib/aws/schemas/common.ts`). Idempotente:
 * un `Put` sobre un id existente lo sobreescribe con los mismos valores.
 */
export async function seedDefaultCategories(userId: string): Promise<UserCategory[]> {
    const createdAt = new Date().toISOString();
    const seeded: UserCategory[] = DEFAULT_CATEGORIES.map((category) => ({
        id: category.id,
        name: category.name,
        status: "active",
        isLocked: category.isLocked,
        isDefault: true,
        createdAt,
    }));

    await Promise.all(
        seeded.map((category) =>
            db.send(
                new PutCommand({
                    TableName: TABLE_NAME,
                    Item: {
                        PK: buildCategoryPK(userId),
                        SK: buildCategorySK(category.id),
                        ...category,
                    },
                })
            )
        )
    );

    return seeded;
}

/**
 * Devuelve las categorías activas del usuario. Si el usuario no tiene ninguna
 * categoría (ni activa ni borrada), siembra las por defecto y las devuelve.
 */
export async function getUserCategories(userId: string): Promise<UserCategory[]> {
    const result = await db.send(
        new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
            ExpressionAttributeValues: {
                ":pk": buildCategoryPK(userId),
                ":sk": "CATEGORY#",
            },
        })
    );

    const items = result.Items ?? [];
    if (items.length === 0) {
        return seedDefaultCategories(userId);
    }

    return items
        .map(toUserCategory)
        .filter((category) => category.status !== "deleted");
}

/** Lee una única categoría por id (incluye borradas). Devuelve null si no existe. */
export async function getUserCategoryById(
    userId: string,
    categoryId: string
): Promise<UserCategory | null> {
    const result = await db.send(
        new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: buildCategoryPK(userId),
                SK: buildCategorySK(categoryId),
            },
        })
    );

    return result.Item ? toUserCategory(result.Item) : null;
}

/**
 * Valida que un `categoryId` corresponda a una categoría activa del usuario.
 * Siembra defaults si el usuario aún no tiene categorías. Devuelve la categoría
 * o `null` si no existe / está borrada.
 */
export async function assertCategoryUsable(
    userId: string,
    categoryId: string
): Promise<UserCategory | null> {
    const categories = await getUserCategories(userId);
    return categories.find((category) => category.id === categoryId) ?? null;
}
