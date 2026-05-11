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
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
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
