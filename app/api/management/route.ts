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

function getStartOfMonth(month: number): Date {
    return new Date(new Date().getFullYear(), month - 1, 1);
}
function getEndOfMonth(month: number): Date {
    return new Date(new Date().getFullYear(), month, 30);
}

export async function POST(request: Request) {
    const body = await request.json();
    const result = managementSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json({ errors: result.error.flatten().fieldErrors }, { status: 400 });
    }
    const { initialAmount, creationDate: creationDateRaw, deductions } = result.data;
    const creationDate = creationDateRaw ? parseDatePreservingCalendarDay(creationDateRaw) : new Date();
    const year = creationDate.getFullYear();
    const item = {
        PK: buildPK(year),
        SK: buildSK(creationDate),
        id: buildUniqueID(),
        initialAmount,
        creationDate: creationDate.toISOString(),
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
    const monthRaw = searchParams.get("month");
    const yearRaw = searchParams.get("year");
    const parsed = getManagementSchema.safeParse({ month: monthRaw, year: yearRaw });

    if (!parsed.success) {
        return NextResponse.json(
            { errors: parsed.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    const year = parsed.data.year ?? new Date().getFullYear();
    const normalizedStartDate = getStartOfMonth(parsed.data.month);
    const normalizedEndDate = getEndOfMonth(parsed.data.month);

    const result = await db.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND SK BETWEEN :sk AND :sk2",
        ExpressionAttributeValues: { ":pk": buildPK(year), ":sk": buildSK(normalizedStartDate), ":sk2": buildSK(normalizedEndDate) }
    }));
    return NextResponse.json(result.Items ?? [], { status: 200 });
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
    } catch (error) {
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
    } catch (error) {
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}