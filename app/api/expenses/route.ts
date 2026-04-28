import { setDateToEndOfDay, setDateToStartOfDay } from "@/app/components/utils/dateHelpers";
import { DeleteCommand, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { NextResponse } from "next/server";
import { db, TABLE_NAME } from "../../../lib/aws/dynamo";
import { expenseSchema, getExpenseSchema, deleteExpenseSchema, updateExpenseSchema } from "../../../lib/aws/schemas";
import { randomBytes } from "node:crypto";


const USER_ID = "123"; // Aquí usarás tu auth

const buildPK = (year: number) => `USER#${USER_ID}#${year}`;
const buildSK = (date?: Date | null) => `EXPENSE#${date ? date.toISOString() : new Date().toISOString()}`;
const buildUniqueID = () => randomBytes(16).toString("hex");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // 1. Validar la data
    const result = expenseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { amount, description, date, category } = result.data;
    const year = new Date(date).getFullYear();

    // 2. Construir el Item para DynamoDB
    const normalizedDate = setDateToStartOfDay(date ? new Date(date) : new Date());
    const item = {
      PK: buildPK(year),
      SK: buildSK(date ? new Date(date) : new Date()),
      id: buildUniqueID(),
      amount,
      description,
      date: normalizedDate.toISOString(),
      category,
      type: "EXPENSE" // Útil para filtrar luego
    };

    // 3. Guardar en AWS
    await db.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }));

    return NextResponse.json({ message: "Gasto guardado", item: result.data }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawStartDate = searchParams.get("startDate");
    const rawEndDate = searchParams.get("endDate");
    const category = searchParams.get("category");
    const parsed = getExpenseSchema.safeParse({ startDate: rawStartDate, endDate: rawEndDate, category });
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const year = new Date(parsed.data.startDate!).getFullYear();
    const normalizedStartDate = setDateToStartOfDay(new Date(parsed.data.startDate!));
    const normalizedEndDate = parsed.data.endDate ? setDateToEndOfDay(new Date(parsed.data.endDate!)) : setDateToEndOfDay(normalizedStartDate);
    const result = await db.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND SK BETWEEN :sk AND :sk2",
      ExpressionAttributeValues: { ":pk": buildPK(year), ":sk": buildSK(normalizedStartDate), ":sk2": buildSK(normalizedEndDate) }
    }));
    if (category) {
      result.Items = result.Items?.filter(item => item.category === category);
    }
    return NextResponse.json(result.Items ?? [], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawDate = searchParams.get("date");
    const id = searchParams.get("id");
    const parsed = deleteExpenseSchema.safeParse({ date: rawDate, id });
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const normalizedStartDate = setDateToStartOfDay(new Date(rawDate!));
    const normalizedEndDate = setDateToEndOfDay(new Date(rawDate!));
    const year = new Date(rawDate!).getFullYear();
    const result = await db.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND SK BETWEEN :sk AND :sk2",
      ExpressionAttributeValues: { ":pk": buildPK(year), ":sk": buildSK(normalizedStartDate), ":sk2": buildSK(normalizedEndDate) }
    }));

    const item = result.Items?.find(item => item.id === id);

    if (result.Items?.length === 0 || !item) {
      return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });
    }

    await db.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: item.PK,
        SK: item.SK,
      }
    }));

    return NextResponse.json({ message: "Gasto eliminado" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const result = updateExpenseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    await db.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: result.data,
    }));
    return NextResponse.json({ message: "Gasto actualizado", item: result.data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}