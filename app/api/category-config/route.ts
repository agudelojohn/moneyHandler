import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/app/api/common/userId";
import { listCategoryConfigs, saveCategoryConfig } from "@/lib/aws/categoryConfig";
import { updateCategoryConfigSchema } from "@/lib/aws/schemas/categoryConfigSchema";

export async function GET(request: Request) {
    const { userId, errorResponse } = getUserIdFromRequest(request);
    if (errorResponse) {
        return errorResponse;
    }

    const configs = await listCategoryConfigs(userId);
    return NextResponse.json(configs, { status: 200 });
}

export async function PUT(request: Request) {
    const { userId, errorResponse } = getUserIdFromRequest(request);
    if (errorResponse) {
        return errorResponse;
    }

    const body = await request.json();
    const parsed = updateCategoryConfigSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { errors: parsed.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    const saved = await saveCategoryConfig(userId, parsed.data.categoryId, parsed.data.switches);
    if (!saved) {
        return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    }

    return NextResponse.json(saved, { status: 200 });
}
