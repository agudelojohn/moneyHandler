import { randomBytes } from "node:crypto";
import { DeleteCommand, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { db, TABLE_NAME } from "./dynamo";
import type { HouseholdTask, HouseholdTaskVisibility } from "./schemas/householdTaskSchema";

const HOUSEHOLD_TASKS_PK = "HOUSEHOLD#TASKS";
const TASK_TYPE = "HOUSEHOLD_TASK";

const isProduction = () => process.env.NEXT_PUBLIC_APP_ENV === "production";

export const buildHouseholdTasksPK = () => HOUSEHOLD_TASKS_PK;

export const buildHouseholdTaskSkPrefix = () => (isProduction() ? "TASK#" : "DEV#TASK#");

export const buildHouseholdTaskSK = (id: string) => `${buildHouseholdTaskSkPrefix()}${id}`;

export class HouseholdTaskNotFoundError extends Error {
  constructor() {
    super("Tarea no encontrada");
    this.name = "HouseholdTaskNotFoundError";
  }
}

export class HouseholdTaskNotPendingError extends Error {
  constructor() {
    super("Solo se pueden modificar tareas pendientes");
    this.name = "HouseholdTaskNotPendingError";
  }
}

export class HouseholdTaskForbiddenError extends Error {
  constructor() {
    super("No puedes modificar esta tarea");
    this.name = "HouseholdTaskForbiddenError";
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

function buildUniqueId() {
  return randomBytes(16).toString("hex");
}

function toHouseholdTask(item: Record<string, unknown>): HouseholdTask | null {
  if (typeof item.id !== "string" || typeof item.description !== "string") {
    return null;
  }
  if (typeof item.creationDate !== "string" || typeof item.createdBy !== "string") {
    return null;
  }
  if (typeof item.updateDate !== "string" || typeof item.lastUpdatedBy !== "string") {
    return null;
  }
  if (item.status !== "pending" && item.status !== "done") {
    return null;
  }

  const visibility: HouseholdTaskVisibility = item.visibility === "personal" ? "personal" : "shared";

  return {
    id: item.id,
    description: item.description,
    creationDate: item.creationDate,
    createdBy: item.createdBy,
    updateDate: item.updateDate,
    lastUpdatedBy: item.lastUpdatedBy,
    doneBy: typeof item.doneBy === "string" ? item.doneBy : null,
    status: item.status,
    visibility,
  };
}

function assertCanMutate(task: HouseholdTask, actorUserId: string): void {
  if (task.visibility === "personal" && task.createdBy !== actorUserId) {
    throw new HouseholdTaskForbiddenError();
  }
}

async function putHouseholdTaskItem(task: HouseholdTask): Promise<void> {
  await db.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: buildHouseholdTasksPK(),
        SK: buildHouseholdTaskSK(task.id),
        type: TASK_TYPE,
        ...task,
      },
    }),
  );
}

export async function getHouseholdTask(id: string): Promise<HouseholdTask | null> {
  const result = await db.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: buildHouseholdTasksPK(),
        SK: buildHouseholdTaskSK(id),
      },
    }),
  );

  if (!result.Item) {
    return null;
  }
  return toHouseholdTask(result.Item);
}

export async function listHouseholdTasks(userId: string): Promise<HouseholdTask[]> {
  const result = await db.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": buildHouseholdTasksPK(),
        ":sk": buildHouseholdTaskSkPrefix(),
      },
    }),
  );

  return (result.Items ?? [])
    .map((item) => toHouseholdTask(item))
    .filter((task): task is HouseholdTask => task !== null)
    .filter((task) => task.visibility === "shared" || task.createdBy === userId)
    .sort((left, right) => left.creationDate.localeCompare(right.creationDate));
}

export async function createHouseholdTask(
  description: string,
  createdBy: string,
  visibility: HouseholdTaskVisibility,
): Promise<HouseholdTask> {
  const timestamp = nowIso();
  const task: HouseholdTask = {
    id: buildUniqueId(),
    description,
    creationDate: timestamp,
    createdBy,
    updateDate: timestamp,
    lastUpdatedBy: createdBy,
    doneBy: null,
    status: "pending",
    visibility,
  };
  await putHouseholdTaskItem(task);
  return task;
}

export async function updateHouseholdTaskDescription(
  id: string,
  description: string,
  lastUpdatedBy: string,
): Promise<HouseholdTask> {
  const existing = await getHouseholdTask(id);
  if (!existing) {
    throw new HouseholdTaskNotFoundError();
  }
  assertCanMutate(existing, lastUpdatedBy);
  if (existing.status !== "pending") {
    throw new HouseholdTaskNotPendingError();
  }

  const updated: HouseholdTask = {
    ...existing,
    description,
    lastUpdatedBy,
    updateDate: nowIso(),
  };
  await putHouseholdTaskItem(updated);
  return updated;
}

export async function markHouseholdTaskDone(id: string, doneBy: string): Promise<HouseholdTask> {
  const existing = await getHouseholdTask(id);
  if (!existing) {
    throw new HouseholdTaskNotFoundError();
  }
  assertCanMutate(existing, doneBy);
  if (existing.status !== "pending") {
    throw new HouseholdTaskNotPendingError();
  }

  const timestamp = nowIso();
  const updated: HouseholdTask = {
    ...existing,
    status: "done",
    doneBy,
    lastUpdatedBy: doneBy,
    updateDate: timestamp,
  };
  await putHouseholdTaskItem(updated);
  return updated;
}

export async function deleteHouseholdTask(id: string, actorUserId: string): Promise<void> {
  const existing = await getHouseholdTask(id);
  if (!existing) {
    throw new HouseholdTaskNotFoundError();
  }
  assertCanMutate(existing, actorUserId);
  if (existing.status !== "pending") {
    throw new HouseholdTaskNotPendingError();
  }

  await db.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: buildHouseholdTasksPK(),
        SK: buildHouseholdTaskSK(id),
      },
    }),
  );
}
