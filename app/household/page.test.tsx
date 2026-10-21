import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HouseholdPage from "@/app/household/page";
import { translations } from "@/app/i18n/translations";
import { renderWithProviders } from "@/test/test-utils";
import type { HouseholdTask } from "@/lib/aws/schemas/householdTaskSchema";

const t = translations.es.household;

const pendingTask: HouseholdTask = {
  id: "pending-1",
  description: "Sacar la basura",
  creationDate: "2026-01-01T00:00:00.000Z",
  createdBy: "6b7b7b40",
  updateDate: "2026-01-01T00:00:00.000Z",
  lastUpdatedBy: "6b7b7b40",
  doneBy: null,
  status: "pending",
};

const doneTask: HouseholdTask = {
  id: "done-1",
  description: "Pagar el arriendo",
  creationDate: "2026-01-02T00:00:00.000Z",
  createdBy: "6b7b7b40",
  updateDate: "2026-01-03T12:00:00.000Z",
  lastUpdatedBy: "8cfdbf65",
  doneBy: "8cfdbf65",
  status: "done",
};

describe("HouseholdPage", () => {
  beforeEach(() => {
    window.sessionStorage.setItem("money-handler-active-user", "alejo");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.includes("/api/household-tasks") && (!init?.method || init.method === "GET")) {
          return Promise.resolve({
            ok: true,
            json: async () => [pendingTask, doneTask],
          });
        }
        if (url.includes("/api/household-tasks") && init?.method === "PATCH") {
          return Promise.resolve({
            ok: true,
            json: async () => ({ ...pendingTask, status: "done", doneBy: "6b7b7b40" }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }),
    );
  });

  afterEach(() => {
    cleanup();
    window.sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it("muestra pendientes y hechas en secciones separadas", async () => {
    renderWithProviders(<HouseholdPage />);

    await waitFor(() => {
      expect(screen.getByText(pendingTask.description)).toBeInTheDocument();
    });

    expect(screen.getByText(t.pendingSection)).toBeInTheDocument();
    expect(screen.getByText(t.doneSection)).toBeInTheDocument();
    expect(screen.getByText(doneTask.description)).toBeInTheDocument();
    expect(screen.getByText(/Clau/)).toBeInTheDocument();
    expect(screen.queryByText(t.emptyPending)).not.toBeInTheDocument();
  });

  it("marca una tarea pending como done con un click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HouseholdPage />);

    await waitFor(() => {
      expect(screen.getByText(pendingTask.description)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: t.markDoneAria }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/household-tasks",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ id: pendingTask.id, status: "done" }),
        }),
      );
    });
  });

  it("muestra el enlace de volver al inicio", async () => {
    renderWithProviders(<HouseholdPage />);

    expect(screen.getByRole("link", { name: translations.es.common.backToHome })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
