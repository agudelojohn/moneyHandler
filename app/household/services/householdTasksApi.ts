import { withUserIdHeader } from "@/app/common/userSession";
import type { HouseholdTask } from "@/lib/aws/schemas/householdTaskSchema";

const HOUSEHOLD_TASKS_ENDPOINT = "/api/household-tasks";

async function parseError(response: Response, fallback: string): Promise<never> {
  const errorData: { error?: string } = await response.json().catch(() => ({}));
  throw new Error(errorData.error ?? fallback);
}

export async function listHouseholdTasks(userId: string): Promise<HouseholdTask[]> {
  const response = await fetch(HOUSEHOLD_TASKS_ENDPOINT, {
    headers: withUserIdHeader(userId),
  });
  if (!response.ok) {
    await parseError(response, "No se pudieron cargar las tareas");
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function createHouseholdTask(description: string, userId: string): Promise<HouseholdTask> {
  const response = await fetch(HOUSEHOLD_TASKS_ENDPOINT, {
    method: "POST",
    headers: withUserIdHeader(userId, { "Content-Type": "application/json" }),
    body: JSON.stringify({ description }),
  });
  if (!response.ok) {
    await parseError(response, "No se pudo crear la tarea");
  }
  return response.json();
}

export async function updateHouseholdTaskDescription(
  id: string,
  description: string,
  userId: string,
): Promise<HouseholdTask> {
  const response = await fetch(HOUSEHOLD_TASKS_ENDPOINT, {
    method: "PATCH",
    headers: withUserIdHeader(userId, { "Content-Type": "application/json" }),
    body: JSON.stringify({ id, description }),
  });
  if (!response.ok) {
    await parseError(response, "No se pudo actualizar la tarea");
  }
  return response.json();
}

export async function markHouseholdTaskDone(id: string, userId: string): Promise<HouseholdTask> {
  const response = await fetch(HOUSEHOLD_TASKS_ENDPOINT, {
    method: "PATCH",
    headers: withUserIdHeader(userId, { "Content-Type": "application/json" }),
    body: JSON.stringify({ id, status: "done" }),
  });
  if (!response.ok) {
    await parseError(response, "No se pudo marcar la tarea como hecha");
  }
  return response.json();
}

export async function deleteHouseholdTask(id: string, userId: string): Promise<void> {
  const response = await fetch(`${HOUSEHOLD_TASKS_ENDPOINT}?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: withUserIdHeader(userId),
  });
  if (!response.ok) {
    await parseError(response, "No se pudo eliminar la tarea");
  }
}
