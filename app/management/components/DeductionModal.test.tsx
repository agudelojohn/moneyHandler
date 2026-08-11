import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeductionModal } from "@/app/management/components/DeductionModal";
import * as managementApi from "@/app/management/services/managementApi";
import type { ManagementRecord } from "@/app/management/types";
import { translations } from "@/app/i18n/translations";
import { renderWithProviders } from "@/test/test-utils";

const sampleRecord: ManagementRecord = {
  id: "rec-1",
  initialAmount: 1000,
  creationDate: new Date().toISOString(),
  startDate: "2026-01-01",
  endDate: "2026-01-31",
  deductions: [],
  staticPayments: [],
};

describe("DeductionModal", () => {
  beforeEach(() => {
    vi.spyOn(managementApi, "appendDeductionToManagementRecord").mockResolvedValue(undefined);
  });

  it("valida descripción y monto antes de llamar al API", async () => {
    const user = userEvent.setup();
    const setOpenDeductionModal = vi.fn();
    const setSelectedRecord = vi.fn();
    const fetchRecordsByDate = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <DeductionModal
        openDeductionModal
        setOpenDeductionModal={setOpenDeductionModal}
        managementRecord={sampleRecord}
        setSelectedRecord={setSelectedRecord}
        fetchRecordsByDate={fetchRecordsByDate}
        baseRequestDate="2026-01-01"
        activeUserId="6b7b7b40"
        categoryId="GASTOS"
      />,
    );

    await user.click(screen.getByRole("button", { name: translations.es.management.addDeduction }));

    expect(screen.getByText(/La descripcion debe tener entre 3 y 50 caracteres/)).toBeInTheDocument();
    expect(managementApi.appendDeductionToManagementRecord).not.toHaveBeenCalled();
  });
});
