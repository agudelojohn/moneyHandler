import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EditInitialAmountModal } from "@/app/management/components/EditInitialAmountModal";
import * as managementApi from "@/app/management/services/managementApi";
import type { ManagementRecord } from "@/app/management/types";
import { translations } from "@/app/i18n/translations";
import { renderWithProviders } from "@/test/test-utils";

const sampleRecord: ManagementRecord = {
  id: "rec-1",
  initialAmount: 1000,
  creationDate: "2026-01-01T00:00:00.000Z",
  startDate: "2026-01-01",
  endDate: "2026-01-31",
  deductions: [],
  staticPayments: [],
};

describe("EditInitialAmountModal", () => {
  beforeEach(() => {
    vi.spyOn(managementApi, "updateInitialAmountInManagementRecord").mockResolvedValue(undefined);
  });

  it("muestra error de validación si el monto inicial no es válido", async () => {
    const user = userEvent.setup();
    const fetchRecordsByDate = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <EditInitialAmountModal
        openEditInitialAmountModal
        setOpenEditInitialAmountModal={vi.fn()}
        managementRecord={sampleRecord}
        setSelectedRecord={vi.fn()}
        fetchRecordsByDate={fetchRecordsByDate}
        baseRequestDate="2026-01-01"
        activeUserId="6b7b7b40"
        categoryId="AHORROS"
      />,
    );

    const amountInput = screen.getByLabelText(translations.es.management.initialAmount);
    await user.clear(amountInput);
    await user.click(screen.getByRole("button", { name: translations.es.management.save }));

    expect(screen.getByText(translations.es.management.initialAmountValidationError)).toBeInTheDocument();
    expect(managementApi.updateInitialAmountInManagementRecord).not.toHaveBeenCalled();
    expect(fetchRecordsByDate).not.toHaveBeenCalled();
  });

  it("guarda el monto inicial como entero aunque se vea en pesos", async () => {
    const user = userEvent.setup();
    const setOpenEditInitialAmountModal = vi.fn();
    const fetchRecordsByDate = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <EditInitialAmountModal
        openEditInitialAmountModal
        setOpenEditInitialAmountModal={setOpenEditInitialAmountModal}
        managementRecord={sampleRecord}
        setSelectedRecord={vi.fn()}
        fetchRecordsByDate={fetchRecordsByDate}
        baseRequestDate="2026-01-01"
        activeUserId="6b7b7b40"
        categoryId="AHORROS"
      />,
    );

    const amountInput = screen.getByLabelText(translations.es.management.initialAmount);
    expect(amountInput).toHaveValue("$1.000");

    await user.clear(amountInput);
    await user.type(amountInput, "500000");
    expect(amountInput).toHaveValue("$500.000");

    await user.click(screen.getByRole("button", { name: translations.es.management.save }));

    expect(managementApi.updateInitialAmountInManagementRecord).toHaveBeenCalledWith(
      sampleRecord,
      500000,
      "6b7b7b40",
      "AHORROS",
    );
    expect(fetchRecordsByDate).toHaveBeenCalledWith("2026-01-01");
  });
});
