import { randomBytes } from "node:crypto";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { NextResponse } from "next/server";
import { db, TABLE_NAME } from "../../../lib/aws/dynamo";
import {
    buildCategoryPK,
    buildCategorySK,
    getUserCategories,
    getUserCategoryById,
} from "../../../lib/aws/categories";
import {
    createCategorySchema,
    deleteCategorySchema,
    updateCategorySchema,
} from "../../../lib/aws/schemas";
import { getUserIdFromRequest } from "../common/userId";

const buildUniqueID = () => randomBytes(16).toString("hex");

const normalizeName = (name: string) => name.trim().toLowerCase();

export async function GET(request: Request) {
    const { userId, errorResponse } = getUserIdFromRequest(request);
    if (errorResponse) {
        return errorResponse;
    }

    const categories = await getUserCategories(userId);
    return NextResponse.json(categories, { status: 200 });
}

export async function POST(request: Request) {
    const { userId, errorResponse } = getUserIdFromRequest(request);
    if (errorResponse) {
        return errorResponse;
    }

    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name } = parsed.data;
    const existing = await getUserCategories(userId);
    const isDuplicate = existing.some((category) => normalizeName(category.name) === normalizeName(name));
    if (isDuplicate) {
        return NextResponse.json({ error: "Ya existe una categoría con ese nombre" }, { status: 409 });
    }

    const category = {
        id: buildUniqueID(),
        name: name.trim(),
        status: "active" as const,
        isLocked: false,
        isDefault: false,
        createdAt: new Date().toISOString(),
    };

    await db.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                PK: buildCategoryPK(userId),
                SK: buildCategorySK(category.id),
                ...category,
            },
        })
    );

    return NextResponse.json(category, { status: 201 });
}

export async function PUT(request: Request) {
    const { userId, errorResponse } = getUserIdFromRequest(request);
    if (errorResponse) {
        return errorResponse;
    }

    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { id, name } = parsed.data;
    const category = await getUserCategoryById(userId, id);
    if (!category || category.status === "deleted") {
        return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    }
    if (category.isLocked) {
        return NextResponse.json({ error: "Esta categoría no se puede modificar" }, { status: 403 });
    }

    const others = await getUserCategories(userId);
    const isDuplicate = others.some(
        (other) => other.id !== id && normalizeName(other.name) === normalizeName(name)
    );
    if (isDuplicate) {
        return NextResponse.json({ error: "Ya existe una categoría con ese nombre" }, { status: 409 });
    }

    const updated = { ...category, name: name.trim() };
    await db.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                PK: buildCategoryPK(userId),
                SK: buildCategorySK(updated.id),
                ...updated,
            },
        })
    );

    return NextResponse.json(updated, { status: 200 });
}

export async function DELETE(request: Request) {
    const { userId, errorResponse } = getUserIdFromRequest(request);
    if (errorResponse) {
        return errorResponse;
    }

    const { searchParams } = new URL(request.url);
    const parsed = deleteCategorySchema.safeParse({ id: searchParams.get("id") });
    if (!parsed.success) {
        return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const category = await getUserCategoryById(userId, parsed.data.id);
    if (!category || category.status === "deleted") {
        return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    }
    if (category.isLocked) {
        return NextResponse.json({ error: "Esta categoría no se puede eliminar" }, { status: 403 });
    }

    const deleted = { ...category, status: "deleted" as const };
    await db.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                PK: buildCategoryPK(userId),
                SK: buildCategorySK(deleted.id),
                ...deleted,
            },
        })
    );

    return NextResponse.json({ message: "Categoría eliminada" }, { status: 200 });
}
