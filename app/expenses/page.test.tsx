import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ExpensesPage from "@/app/expenses/page";
import { translations } from "@/app/i18n/translations";
import { renderWithProviders } from "@/test/test-utils";

describe("ExpensesPage", () => {
  beforeEach(() => {
    sessionStorage.setItem("money-handler-active-user", "alejo");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/api/categories")) {
          return Promise.resolve({
            ok: true,
            json: async () => [
              { id: "GASTOS", name: "Gastos", status: "active", isLocked: true, isDefault: true, createdAt: "2026-01-01T00:00:00.000Z" },
              { id: "VIAJES", name: "Viajes", status: "active", isLocked: false, isDefault: false, createdAt: "2026-01-02T00:00:00.000Z" },
            ],
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
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it("muestra el enlace de volver al inicio", () => {
    renderWithProviders(<ExpensesPage />);
    expect(screen.getByRole("link", { name: translations.es.common.backToHome })).toHaveAttribute("href", "/");
  });
});
