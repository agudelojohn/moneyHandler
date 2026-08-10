import { randomBytes } from "node:crypto";
import {
    parseDatePreservingCalendarDay,
    toUtcEndOfCalendarDay,
    toUtcStartOfCalendarDay,
} from "../common/utils";
import { isValidDateRangeOrder } from "@/app/common/utils/dateHelpers";
import { DeleteCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { db, TABLE_NAME } from "../../../lib/aws/dynamo";
import { NextResponse } from "next/server";
import {
    deleteManagementSchema,
    getManagementSchema,
    managementSchema,
    updateManagementSchema
} from "../../../lib/aws/schemas";
import { getUserIdFromRequest } from "../common/userId";
import { assertCategoryUsable } from "../../../lib/aws/categories";

const buildPK = (userId: string, year: number) => `MANAGEMENT#${userId}#${year}`;
// La categoría se referencia por su `id` estable (ya viene canónico, no se
// re-uppercasea). Para las categorías por defecto el id coincide con el nombre
// en mayúsculas, preservando la compatibilidad con los SK históricos.
const buildSK = (date?: Date | null, categoryId?: string) => `${process.env.NEXT_PUBLIC_APP_ENV === "production" ? "" : "DEV#"}ADDITION#${(categoryId ?? "OTROS")}#${date ? date.toISOString() : new Date().toISOString()}`;
const buildUniqueID = () => randomBytes(16).toString("hex");

function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
    const instant = date.getTime();
    return instant >= startDate.getTime() && instant <= endDate.getTime();
}

function doRangesOverlap(
    startDateA: Date,
    endDateA: Date,
    startDateB: Date,
    endDateB: Date
): boolean {
    return startDateA.getTime() <= endDateB.getTime() && startDateB.getTime() <= endDateA.getTime();
}

export async function POST(request: Request) {
    const { userId, errorResponse } = getUserIdFromRequest(request);
    if (errorResponse) {
        return errorResponse;
    }

    const body = await request.json();
    const result = managementSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json({ errors: result.error.flatten().fieldErrors }, { status: 400 });
    }
    const {
        categoryId,
        initialAmount,
        creationDate: creationDateRaw,
        startDate: startDateRaw,
        endDate: endDateRaw,
        deductions,
        staticPayments,
    } = result.data;

    const usableCategory = await assertCategoryUsable(userId, categoryId);
    if (!usableCategory) {
        return NextResponse.json({ error: "Categoría inválida" }, { status: 400 });
    }

    const creationDate = creationDateRaw ? parseDatePreservingCalendarDay(creationDateRaw) : new Date();
    const startDate = parseDatePreservingCalendarDay(startDateRaw);
    const endDate = parseDatePreservingCalendarDay(endDateRaw);

    if (!isValidDateRangeOrder(startDateRaw, endDateRaw)) {
        return NextResponse.json(
            { error: "La fecha final no puede ser anterior a la fecha inicial" },
            { status: 400 }
        );
    }

    const startYear = startDate.getUTCFullYear();
    const endYear = endDate.getUTCFullYear();
    for (let yearToCheck = startYear; yearToCheck <= endYear; yearToCheck += 1) {
        const startOfYear = new Date(Date.UTC(yearToCheck, 0, 1));
        const endOfYear = new Date(Date.UTC(yearToCheck, 11, 31, 23, 59, 59, 999));
        const queryResult = await db.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "PK = :pk AND SK BETWEEN :sk AND :sk2",
            ExpressionAttributeValues: {
                ":pk": buildPK(userId, yearToCheck),
                ":sk": buildSK(startOfYear, categoryId),
                ":sk2": buildSK(endOfYear, categoryId),
            }
        }));

        const hasOverlap = (queryResult.Items ?? []).some((existingItem) => {
            const existingStartDateRaw = typeof existingItem.startDate === "string"
                ? existingItem.startDate
                : existingItem.creationDate;
            const existingEndDateRaw = typeof existingItem.endDate === "string"
                ? existingItem.endDate
                : existingItem.creationDate;
            const existingStartDate = parseDatePreservingCalendarDay(existingStartDateRaw);
            const existingEndDate = parseDatePreservingCalendarDay(existingEndDateRaw);

            return doRangesOverlap(startDate, endDate, existingStartDate, existingEndDate);
        });

        if (hasOverlap) {
            return NextResponse.json(
                { error: "El rango de fechas se solapa con un registro existente" },
                { status: 409 }
            );
        }
    }

    const year = creationDate.getUTCFullYear();
    const item = {
        PK: buildPK(userId, year),
        SK: buildSK(creationDate, categoryId),
        id: buildUniqueID(),
        categoryId,
        category: usableCategory.name,
        initialAmount,
        creationDate: creationDate.toISOString(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        deductions,
        staticPayments,
    };
    await db.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
    }));
    return NextResponse.json(item, { status: 201 });
}

export async function GET(request: Request) {
    const { userId, errorResponse } = getUserIdFromRequest(request);
    if (errorResponse) {
        return errorResponse;
    }

    const { searchParams } = new URL(request.url);
    const dateRaw = searchParams.get("date");
    const categoryIdRaw = searchParams.get("categoryId");
    const parsed = getManagementSchema.safeParse({ date: dateRaw, categoryId: categoryIdRaw });

    if (!parsed.success) {
        return NextResponse.json(
            { errors: parsed.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    const requestedDate = parseDatePreservingCalendarDay(parsed.data.date);
    const { categoryId } = parsed.data;
    const year = requestedDate.getUTCFullYear();
    const startOfYear = new Date(Date.UTC(year, 0, 1));
    const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

    const result = await db.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND SK BETWEEN :sk AND :sk2",
        ExpressionAttributeValues: {
            ":pk": buildPK(userId, year),
            ":sk": buildSK(startOfYear, categoryId),
            ":sk2": buildSK(endOfYear, categoryId),
        },
    }));

    const filteredItems = (result.Items ?? [])
        .filter((item) => {
            const startDateRaw = typeof item.startDate === "string" ? item.startDate : item.creationDate;
            const endDateRaw = typeof item.endDate === "string" ? item.endDate : item.creationDate;
            const startDate = parseDatePreservingCalendarDay(startDateRaw);
            const endDate = parseDatePreservingCalendarDay(endDateRaw);
            return isDateInRange(requestedDate, startDate, endDate);
        })
        .map((item) => ({
            ...item,
            deductions: Array.isArray(item.deductions)
                ? item.deductions.map((deduction) => ({
                    ...deduction,
                    isCredit: Boolean(deduction.isCredit),
                    isPayed: Boolean(deduction.isPayed),
                }))
                : [],
            staticPayments: Array.isArray(item.staticPayments)
                ? item.staticPayments.map((staticPayment) => ({
                    ...staticPayment,
                    isCredit: Boolean(staticPayment.isCredit),
                    isPayed: Boolean(staticPayment.isPayed),
                }))
                : [],
        }));

    return NextResponse.json(filteredItems, { status: 200 });
}

export async function DELETE(request: Request) {
    try {
        const { userId, errorResponse } = getUserIdFromRequest(request);
        if (errorResponse) {
            return errorResponse;
        }

        const { searchParams } = new URL(request.url);
        const rawDate = searchParams.get("date");
        const id = searchParams.get("id");
        const rawCategoryId = searchParams.get("categoryId");
        const parsed = deleteManagementSchema.safeParse({ date: rawDate, id, categoryId: rawCategoryId });

        if (!parsed.success) {
            return NextResponse.json(
                { errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const parsedDate = parseDatePreservingCalendarDay(parsed.data.date);
        const dayStart = toUtcStartOfCalendarDay(parsedDate);
        const dayEnd = toUtcEndOfCalendarDay(parsedDate);
        const year = dayStart.getUTCFullYear();
        const { categoryId } = parsed.data;

        const result = await db.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "PK = :pk AND SK BETWEEN :sk AND :sk2",
            ExpressionAttributeValues: {
                ":pk": buildPK(userId, year),
                ":sk": buildSK(dayStart, categoryId),
                ":sk2": buildSK(dayEnd, categoryId),
            }
        }));

        const item = result.Items?.find((entry) => entry.id === parsed.data.id);

        if (!item) {
            return NextResponse.json({ error: "Registro de gestión no encontrado" }, { status: 404 });
        }

        await db.send(new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: item.PK,
                SK: item.SK,
            }
        }));

        return NextResponse.json({ message: "Registro de gestión eliminado" }, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { userId, errorResponse } = getUserIdFromRequest(request);
        if (errorResponse) {
            return errorResponse;
        }

        const body = await request.json();
        const parsed = updateManagementSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const parsedDate = parseDatePreservingCalendarDay(parsed.data.date);
        const dayStart = toUtcStartOfCalendarDay(parsedDate);
        const dayEnd = toUtcEndOfCalendarDay(parsedDate);
        const year = dayStart.getUTCFullYear();
        const { categoryId } = parsed.data;

        const result = await db.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "PK = :pk AND SK BETWEEN :sk AND :sk2",
            ExpressionAttributeValues: {
                ":pk": buildPK(userId, year),
                ":sk": buildSK(dayStart, categoryId),
                ":sk2": buildSK(dayEnd, categoryId),
            }
        }));

        const originalItem = result.Items?.find((entry) => entry.id === parsed.data.id);

        if (!originalItem) {
            return NextResponse.json({ error: "Registro de gestión no encontrado" }, { status: 404 });
        }

        const staticPayments =
            parsed.data.staticPayments !== undefined
                ? parsed.data.staticPayments
                : Array.isArray(originalItem.staticPayments)
                    ? originalItem.staticPayments
                    : [];

        let startDate = parseDatePreservingCalendarDay(
            typeof originalItem.startDate === "string"
                ? originalItem.startDate
                : originalItem.creationDate
        );
        let endDate = parseDatePreservingCalendarDay(
            typeof originalItem.endDate === "string"
                ? originalItem.endDate
                : originalItem.creationDate
        );

        if (parsed.data.startDate !== undefined && parsed.data.endDate !== undefined) {
            if (!isValidDateRangeOrder(parsed.data.startDate, parsed.data.endDate)) {
                return NextResponse.json(
                    { error: "La fecha final no puede ser anterior a la fecha inicial" },
                    { status: 400 }
                );
            }

            startDate = parseDatePreservingCalendarDay(parsed.data.startDate);
            endDate = parseDatePreservingCalendarDay(parsed.data.endDate);

            const startYear = startDate.getUTCFullYear();
            const endYear = endDate.getUTCFullYear();
            for (let yearToCheck = startYear; yearToCheck <= endYear; yearToCheck += 1) {
                const startOfYear = new Date(Date.UTC(yearToCheck, 0, 1));
                const endOfYear = new Date(Date.UTC(yearToCheck, 11, 31, 23, 59, 59, 999));
                const queryResult = await db.send(new QueryCommand({
                    TableName: TABLE_NAME,
                    KeyConditionExpression: "PK = :pk AND SK BETWEEN :sk AND :sk2",
                    ExpressionAttributeValues: {
                        ":pk": buildPK(userId, yearToCheck),
                        ":sk": buildSK(startOfYear, categoryId),
                        ":sk2": buildSK(endOfYear, categoryId),
                    }
                }));

                const hasOverlap = (queryResult.Items ?? []).some((existingItem) => {
                    if (existingItem.id === parsed.data.id) {
                        return false;
                    }

                    const existingStartDateRaw = typeof existingItem.startDate === "string"
                        ? existingItem.startDate
                        : existingItem.creationDate;
                    const existingEndDateRaw = typeof existingItem.endDate === "string"
                        ? existingItem.endDate
                        : existingItem.creationDate;
                    const existingStartDate = parseDatePreservingCalendarDay(existingStartDateRaw);
                    const existingEndDate = parseDatePreservingCalendarDay(existingEndDateRaw);

                    return doRangesOverlap(startDate, endDate, existingStartDate, existingEndDate);
                });

                if (hasOverlap) {
                    return NextResponse.json(
                        { error: "El rango de fechas se solapa con un registro existente" },
                        { status: 409 }
                    );
                }
            }
        }

        const updatedItem = {
            ...originalItem,
            categoryId,
            category: originalItem.category,
            deductions: parsed.data.deductions,
            staticPayments,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        };

        await db.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: updatedItem,
        }));

        return NextResponse.json({ message: "Deducciones actualizadas", item: updatedItem }, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}