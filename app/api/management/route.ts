import { randomBytes } from "node:crypto";
import { parseDatePreservingCalendarDay } from "../common/utils";
import { DeleteCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { db, TABLE_NAME } from "../../../lib/aws/dynamo";
import { NextResponse } from "next/server";
import {
    deleteManagementSchema,
    getManagementSchema,
    managementSchema,
    updateManagementSchema
} from "../../../lib/aws/schemas";

const USER_ID = "123"; // Aquí usarás tu auth

const buildPK = (year: number) => `MANAGEMENT#${USER_ID}#${year}`;
const buildSK = (date?: Date | null) => `ADDITION#${date ? date.toISOString() : new Date().toISOString()}`;
const buildUniqueID = () => randomBytes(16).toString("hex");

function normalizeDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
    const normalizedDate = normalizeDate(date).getTime();
    const normalizedStartDate = normalizeDate(startDate).getTime();
    const normalizedEndDate = normalizeDate(endDate).getTime();
    return normalizedDate >= normalizedStartDate && normalizedDate <= normalizedEndDate;
}

function doRangesOverlap(
    startDateA: Date,
    endDateA: Date,
    startDateB: Date,
    endDateB: Date
): boolean {
    const normalizedStartA = normalizeDate(startDateA).getTime();
    const normalizedEndA = normalizeDate(endDateA).getTime();
    const normalizedStartB = normalizeDate(startDateB).getTime();
    const normalizedEndB = normalizeDate(endDateB).getTime();

    return normalizedStartA <= normalizedEndB && normalizedStartB <= normalizedEndA;
}

export async function POST(request: Request) {
    const body = await request.json();
    const result = managementSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json({ errors: result.error.flatten().fieldErrors }, { status: 400 });
    }
    const { initialAmount, creationDate: creationDateRaw, startDate: startDateRaw, endDate: endDateRaw, deductions } = result.data;
    const creationDate = creationDateRaw ? parseDatePreservingCalendarDay(creationDateRaw) : new Date();
    const startDate = parseDatePreservingCalendarDay(startDateRaw);
    const endDate = parseDatePreservingCalendarDay(endDateRaw);

    if (normalizeDate(startDate).getTime() > normalizeDate(endDate).getTime()) {
        return NextResponse.json({ error: "La fecha inicial no puede ser mayor a la fecha final" }, { status: 400 });
    }

    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    for (let yearToCheck = startYear; yearToCheck <= endYear; yearToCheck += 1) {
        const startOfYear = new Date(yearToCheck, 0, 1);
        const endOfYear = new Date(yearToCheck, 11, 31, 23, 59, 59, 999);
        const queryResult = await db.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "PK = :pk AND SK BETWEEN :sk AND :sk2",
            ExpressionAttributeValues: {
                ":pk": buildPK(yearToCheck),
                ":sk": buildSK(startOfYear),
                ":sk2": buildSK(endOfYear),
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

    const year = creationDate.getFullYear();
    const item = {
        PK: buildPK(year),
        SK: buildSK(creationDate),
        id: buildUniqueID(),
        initialAmount,
        creationDate: creationDate.toISOString(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        deductions,
    };
    await db.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
    }));
    return NextResponse.json(item, { status: 201 });
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const dateRaw = searchParams.get("date");
    const parsed = getManagementSchema.safeParse({ date: dateRaw });

    if (!parsed.success) {
        return NextResponse.json(
            { errors: parsed.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    const requestedDate = parseDatePreservingCalendarDay(parsed.data.date);
    const year = requestedDate.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const result = await db.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND SK BETWEEN :sk AND :sk2",
        ExpressionAttributeValues: { ":pk": buildPK(year), ":sk": buildSK(startOfYear), ":sk2": buildSK(endOfYear) }
    }));

    const filteredItems = (result.Items ?? []).filter((item) => {
        const startDateRaw = typeof item.startDate === "string" ? item.startDate : item.creationDate;
        const endDateRaw = typeof item.endDate === "string" ? item.endDate : item.creationDate;
        const startDate = parseDatePreservingCalendarDay(startDateRaw);
        const endDate = parseDatePreservingCalendarDay(endDateRaw);
        return isDateInRange(requestedDate, startDate, endDate);
    });

    return NextResponse.json(filteredItems, { status: 200 });
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const rawDate = searchParams.get("date");
        const id = searchParams.get("id");
        const parsed = deleteManagementSchema.safeParse({ date: rawDate, id });

        if (!parsed.success) {
            return NextResponse.json(
                { errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const parsedDate = parseDatePreservingCalendarDay(parsed.data.date);
        const normalizedDate = normalizeDate(parsedDate);
        const year = normalizedDate.getFullYear();

        const result = await db.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "PK = :pk AND SK BETWEEN :sk AND :sk2",
            ExpressionAttributeValues: {
                ":pk": buildPK(year),
                ":sk": buildSK(normalizedDate),
                ":sk2": buildSK(new Date(normalizedDate.getFullYear(), normalizedDate.getMonth(), normalizedDate.getDate(), 23, 59, 59, 999)),
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
        const body = await request.json();
        const parsed = updateManagementSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const parsedDate = parseDatePreservingCalendarDay(parsed.data.date);
        const normalizedDate = normalizeDate(parsedDate);
        const year = normalizedDate.getFullYear();

        const result = await db.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "PK = :pk AND SK BETWEEN :sk AND :sk2",
            ExpressionAttributeValues: {
                ":pk": buildPK(year),
                ":sk": buildSK(normalizedDate),
                ":sk2": buildSK(new Date(normalizedDate.getFullYear(), normalizedDate.getMonth(), normalizedDate.getDate(), 23, 59, 59, 999)),
            }
        }));

        const originalItem = result.Items?.find((entry) => entry.id === parsed.data.id);

        if (!originalItem) {
            return NextResponse.json({ error: "Registro de gestión no encontrado" }, { status: 404 });
        }

        const updatedItem = {
            ...originalItem,
            deductions: parsed.data.deductions,
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