import { screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ExpensesDashboard from "@/app/components/ExpensesDashboard";
import { renderWithProviders } from "@/test/test-utils";

describe("ExpensesDashboard", () => {
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

  it("carga gastos cuando hay usuario en sesión", async () => {
    renderWithProviders(<ExpensesDashboard />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });
});
