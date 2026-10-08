import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import {
    defaultCategorySwitches,
    normalizeCategorySwitches,
    type CategoryConfig,
    type CategorySwitches,
} from "@/app/management/categorySwitches";
import { env } from "@/lib/config/env";
import { assertCategoryUsable, getUserCategories } from "./categories";
import { db, TABLE_NAME } from "./dynamo";

const isProduction = () => env.NEXT_PUBLIC_APP_ENV === "production";

export const buildCategoryConfigPK = (userId: string) => `CATEGORYCONFIG#${userId}`;

export const buildCategoryConfigSkPrefix = () => (isProduction() ? "CONFIG#" : "DEV#CONFIG#");

export const buildCategoryConfigSK = (categoryId: string) => `${buildCategoryConfigSkPrefix()}${categoryId}`;

function readUpdatedAt(item: Record<string, unknown>): string | null {
    return typeof item.updatedAt === "string" ? item.updatedAt : null;
}

export async function listCategoryConfigs(userId: string): Promise<CategoryConfig[]> {
    const categories = await getUserCategories(userId);
    const result = await db.send(
        new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
            ExpressionAttributeValues: {
                ":pk": buildCategoryConfigPK(userId),
                ":sk": buildCategoryConfigSkPrefix(),
            },
        })
    );

    const stored = new Map<string, CategoryConfig>();
    for (const item of result.Items ?? []) {
        if (typeof item.categoryId !== "string") {
            continue;
        }
        stored.set(item.categoryId, {
            categoryId: item.categoryId,
            switches: normalizeCategorySwitches(item.categoryId, item.switches),
            updatedAt: readUpdatedAt(item),
        });
    }

    return categories.map((category) => stored.get(category.id) ?? {
        categoryId: category.id,
        switches: defaultCategorySwitches(category.id),
        updatedAt: null,
    });
}

export async function saveCategoryConfig(
    userId: string,
    categoryId: string,
    switches: CategorySwitches,
): Promise<CategoryConfig | null> {
    const category = await assertCategoryUsable(userId, categoryId);
    if (!category) {
        return null;
    }

    const updatedAt = new Date().toISOString();
    const config: CategoryConfig = { categoryId, switches, updatedAt };

    await db.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                PK: buildCategoryConfigPK(userId),
                SK: buildCategoryConfigSK(categoryId),
                ...config,
            },
        })
    );

    return config;
}
