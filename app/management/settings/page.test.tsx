import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CategorySettingsPage from "@/app/management/settings/page";
import * as categoryConfigApi from "@/app/management/services/categoryConfigApi";
import * as categoriesApi from "@/app/management/services/categoriesApi";
import { EXPENSES_CATEGORY_ID } from "@/lib/aws/schemas/common";
import { renderWithProviders } from "@/test/test-utils";

const mockGet = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => ({
    get: (key: string) => mockGet(key),
  }),
}));

describe("CategorySettingsPage", () => {
  beforeEach(() => {
    window.sessionStorage.setItem("money-handler-active-user", "alejo");
    mockGet.mockImplementation((key: string) => (key === "categoryId" ? EXPENSES_CATEGORY_ID : null));
    vi.spyOn(categoriesApi, "listCategories").mockResolvedValue([
      {
        id: EXPENSES_CATEGORY_ID,
        name: "Gastos",
        isLocked: true,
        status: "active",
        isDefault: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
    vi.spyOn(categoryConfigApi, "listCategoryConfigs").mockResolvedValue([]);
    vi.spyOn(categoryConfigApi, "updateCategoryConfig").mockResolvedValue({
      categoryId: EXPENSES_CATEGORY_ID,
      switches: { dailyConfiguration: true },
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
  });

  it("muestra Gastos con la configuración diaria apagada y guarda el encendido", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CategorySettingsPage />);

    const dailySwitch = await screen.findByRole("switch", { name: "Configuracion diaria" });
    await waitFor(() => {
      expect(dailySwitch).toBeEnabled();
    });
    expect(dailySwitch).not.toBeChecked();

    await user.click(dailySwitch);

    await waitFor(() => {
      expect(categoryConfigApi.updateCategoryConfig).toHaveBeenCalledWith(
        EXPENSES_CATEGORY_ID,
        { dailyConfiguration: true },
        "6b7b7b40",
      );
    });
    expect(dailySwitch).toBeChecked();
  });
});
