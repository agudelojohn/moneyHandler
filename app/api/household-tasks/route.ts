import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "../common/userId";
import {
  createHouseholdTaskSchema,
  deleteHouseholdTaskSchema,
  patchHouseholdTaskSchema,
} from "@/lib/aws/schemas";
import {
  HouseholdTaskNotFoundError,
  HouseholdTaskNotPendingError,
  createHouseholdTask,
  deleteHouseholdTask,
  listHouseholdTasks,
  markHouseholdTaskDone,
  updateHouseholdTaskDescription,
} from "@/lib/aws/householdTasks";

function mapDaoError(error: unknown) {
  if (error instanceof HouseholdTaskNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  if (error instanceof HouseholdTaskNotPendingError) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }
  return NextResponse.json({ error: "Error interno" }, { status: 500 });
}

export async function GET(request: Request) {
  const { errorResponse } = getUserIdFromRequest(request);
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const tasks = await listHouseholdTasks();
    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId, errorResponse } = getUserIdFromRequest(request);
  if (errorResponse || !userId) {
    return errorResponse ?? NextResponse.json({ error: "Usuario inválido o no seleccionado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createHouseholdTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const task = await createHouseholdTask(parsed.data.description, userId);
    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { userId, errorResponse } = getUserIdFromRequest(request);
  if (errorResponse || !userId) {
    return errorResponse ?? NextResponse.json({ error: "Usuario inválido o no seleccionado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = patchHouseholdTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    if (parsed.data.status === "done") {
      const task = await markHouseholdTaskDone(parsed.data.id, userId);
      return NextResponse.json(task);
    }

    const task = await updateHouseholdTaskDescription(
      parsed.data.id,
      parsed.data.description ?? "",
      userId,
    );
    return NextResponse.json(task);
  } catch (error) {
    return mapDaoError(error);
  }
}

export async function DELETE(request: Request) {
  const { errorResponse } = getUserIdFromRequest(request);
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const parsed = deleteHouseholdTaskSchema.safeParse({ id: searchParams.get("id") });
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    await deleteHouseholdTask(parsed.data.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return mapDaoError(error);
  }
}
