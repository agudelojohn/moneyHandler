import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateManagementModal } from "@/app/management/components/CreateManagementModal";
import * as managementApi from "@/app/management/services/managementApi";
import { translations } from "@/app/i18n/translations";
import { renderWithProviders } from "@/test/test-utils";

describe("CreateManagementModal", () => {
  beforeEach(() => {
    vi.spyOn(managementApi, "createManagementRecord").mockResolvedValue(undefined);
  });

  it("muestra error de validación si el monto inicial no es válido", async () => {
    const user = userEvent.setup();
    const setOpenCreateModal = vi.fn();
    const fetchRecordsByDate = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <CreateManagementModal
        openCreateModal
        setOpenCreateModal={setOpenCreateModal}
        fetchRecordsByDate={fetchRecordsByDate}
        baseRequestDate="2026-01-01"
        activeUserId="6b7b7b40"
        categoryId="GASTOS"
        suggestedRangeDate={null}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: translations.es.expenses.createRecord }),
    );

    expect(screen.getByText(translations.es.management.initialAmountValidationError)).toBeInTheDocument();
    expect(managementApi.createManagementRecord).not.toHaveBeenCalled();
  });
});
