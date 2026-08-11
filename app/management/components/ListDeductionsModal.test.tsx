import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ListDeductionsModal } from "@/app/management/components/ListDeductionsModal";
import type { ManagementRecord } from "@/app/management/types";
import { translations } from "@/app/i18n/translations";
import { renderWithProviders } from "@/test/test-utils";

const record: ManagementRecord = {
  id: "r1",
  initialAmount: 1,
  creationDate: new Date().toISOString(),
  deductions: [],
  staticPayments: [],
};

describe("ListDeductionsModal", () => {
  it("muestra estado vacío cuando no hay deducciones", () => {
    renderWithProviders(
      <ListDeductionsModal
        managementRecord={record}
        openViewDeductionsModal
        setOpenViewDeductionsModal={vi.fn()}
        deductionsCollection={[]}
        handleDraftDeductionChange={vi.fn()}
        currencyFormatter={new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" })}
        setSelectedRecord={vi.fn()}
        fetchRecordsByDate={vi.fn()}
        baseRequestDate="2026-01-01"
        setDeletingDeductionIndex={vi.fn()}
        deletingDeductionIndex={null}
        setDeductionsCollection={vi.fn()}
        activeUserId="6b7b7b40"
        categoryId="GASTOS"
      />,
    );

    expect(screen.getByText(translations.es.management.listDeductionsTitle)).toBeInTheDocument();
    expect(screen.getByText(translations.es.management.noDeductions)).toBeInTheDocument();
  });
});
