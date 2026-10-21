import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.AWS_ACCESS_KEY_ID ??= "test";
  process.env.AWS_SECRET_ACCESS_KEY ??= "test";
  process.env.AWS_TABLE_NAME ??= "test";
  process.env.AWS_REGION ??= "us-east-1";
  process.env.AWS_TABLE_NAME_DEV ??= "test-dev";
  process.env.NEXT_PUBLIC_APP_ENV ??= "development";
  process.env.NEXT_PUBLIC_FEATURE_MANAGEMENT ??= "true";
  process.env.NEXT_PUBLIC_FEATURE_EXPENSES ??= "true";
});

import { db } from "./dynamo";
import {
  HouseholdTaskNotPendingError,
  createHouseholdTask,
  listHouseholdTasks,
  markHouseholdTaskDone,
  updateHouseholdTaskDescription,
} from "./householdTasks";
import type { HouseholdTask } from "./schemas/householdTaskSchema";

const pendingTask: HouseholdTask = {
  id: "task-1",
  description: "Sacar la basura",
  creationDate: "2026-01-02T00:00:00.000Z",
  createdBy: "6b7b7b40",
  updateDate: "2026-01-02T00:00:00.000Z",
  lastUpdatedBy: "6b7b7b40",
  doneBy: null,
  status: "pending",
};

const olderTask: HouseholdTask = {
  ...pendingTask,
  id: "task-0",
  description: "Lavar platos",
  creationDate: "2026-01-01T00:00:00.000Z",
  updateDate: "2026-01-01T00:00:00.000Z",
};

const doneTask: HouseholdTask = {
  ...pendingTask,
  id: "task-done",
  status: "done",
  doneBy: "8cfdbf65",
  lastUpdatedBy: "8cfdbf65",
};

describe("householdTasks DAO", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "development");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("crea una tarea pending con auditoria del usuario", async () => {
    const send = vi.spyOn(db, "send").mockResolvedValue({} as never);

    const created = await createHouseholdTask("Comprar pan", "6b7b7b40");

    expect(created.description).toBe("Comprar pan");
    expect(created.status).toBe("pending");
    expect(created.createdBy).toBe("6b7b7b40");
    expect(created.lastUpdatedBy).toBe("6b7b7b40");
    expect(created.doneBy).toBeNull();
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("lista las tareas ordenadas por fecha de creacion", async () => {
    vi.spyOn(db, "send").mockResolvedValue({
      Items: [pendingTask, olderTask],
    } as never);

    const tasks = await listHouseholdTasks();

    expect(tasks.map((task) => task.id)).toEqual(["task-0", "task-1"]);
  });

  it("marca una tarea pending como done con doneBy", async () => {
    const send = vi
      .spyOn(db, "send")
      .mockResolvedValueOnce({ Item: pendingTask } as never)
      .mockResolvedValueOnce({} as never);

    const updated = await markHouseholdTaskDone("task-1", "8cfdbf65");

    expect(updated.status).toBe("done");
    expect(updated.doneBy).toBe("8cfdbf65");
    expect(updated.lastUpdatedBy).toBe("8cfdbf65");
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("rechaza editar una tarea que ya esta done", async () => {
    vi.spyOn(db, "send").mockResolvedValue({ Item: doneTask } as never);

    await expect(updateHouseholdTaskDescription("task-done", "Otra", "6b7b7b40")).rejects.toBeInstanceOf(
      HouseholdTaskNotPendingError,
    );
  });
});
