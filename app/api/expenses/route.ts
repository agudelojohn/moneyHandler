import { NextResponse } from "next/server";
import { expenseSchema } from "../../../lib/aws/schemas/expenseSchema";
import { db, TABLE_NAME } from "../../../lib/aws/dynamo";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { normalizeDate, setDateToStartOfDay } from "@/app/components/utils/dateHelpers";


const USER_ID = "123"; // Aquí usarás tu auth

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
      PK: `USER#${USER_ID}#${year}`,
      SK: `EXPENSE#${date.split('T')[0]}#${Date.now()}`,
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

    return NextResponse.json({ message: "Gasto guardado" }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date')
    const year = searchParams.get('year');

    console.log('DEBUGGER: ', date, year);

    return NextResponse.json({ message: "Hello World" }, { status: 200 });
    // db.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK: `USER#${USER_ID}#${year}`, SK: `EXPENSE#${date}#${Date.now()}` } }));
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}