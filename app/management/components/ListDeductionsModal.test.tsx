import { cleanup, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ListDeductionsModal } from "@/app/management/components/ListDeductionsModal";
import type { Deduction, ManagementRecord } from "@/app/management/types";
import { translations } from "@/app/i18n/translations";
import { renderWithProviders } from "@/test/test-utils";

const record: ManagementRecord = {
  id: "r1",
  initialAmount: 1,
  creationDate: new Date().toISOString(),
  deductions: [],
  staticPayments: [],
};

const deductions: Deduction[] = [
  { description: "Almuerzo", amount: 15000, isCredit: false, isPayed: false },
  { description: "Prestamo", amount: 40000, isCredit: true, isPayed: false },
];

const t = translations.es.management;
const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
});

function renderModal(
  overrides: Partial<ComponentProps<typeof ListDeductionsModal>> = {},
) {
  return renderWithProviders(
    <ListDeductionsModal
      managementRecord={record}
      openViewDeductionsModal
      setOpenViewDeductionsModal={vi.fn()}
      deductionsCollection={[]}
      handleDraftDeductionChange={vi.fn()}
      currencyFormatter={currencyFormatter}
      setSelectedRecord={vi.fn()}
      fetchRecordsByDate={vi.fn()}
      baseRequestDate="2026-01-01"
      setDeletingDeductionIndex={vi.fn()}
      deletingDeductionIndex={null}
      setDeductionsCollection={vi.fn()}
      activeUserId="6b7b7b40"
      categoryId="GASTOS"
      {...overrides}
    />,
  );
}

describe("ListDeductionsModal", () => {
  afterEach(() => {
    cleanup();
  });
  it("muestra estado vacío cuando no hay deducciones", () => {
    renderModal();

    expect(screen.getByText(t.listDeductionsTitle)).toBeInTheDocument();
    expect(screen.getByText(t.noDeductions)).toBeInTheDocument();
  });

  it("muestra las deducciones en una tabla con encabezados y celdas", () => {
    renderModal({ deductionsCollection: deductions });

    const table = screen.getByRole("table");
    expect(
      within(table).getByRole("columnheader", { name: t.deductionDescription }),
    ).toBeInTheDocument();
    expect(within(table).getByRole("columnheader", { name: t.amount })).toBeInTheDocument();
    expect(within(table).getByRole("columnheader", { name: t.credit })).toBeInTheDocument();
    expect(within(table).getByRole("columnheader", { name: t.actions })).toBeInTheDocument();
    expect(within(table).getByText("Almuerzo")).toBeInTheDocument();
    expect(within(table).getByText("Prestamo")).toBeInTheDocument();
    expect(within(table).getByText(/15\.000/)).toBeInTheDocument();
    expect(within(table).getByText(/40\.000/)).toBeInTheDocument();
  });

  it("usa botones de icono para editar y eliminar, sin texto visible", () => {
    renderModal({ deductionsCollection: deductions });

    expect(screen.getAllByRole("button", { name: t.editDeductionAria })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: t.deleteDeductionAria })).toHaveLength(2);
    expect(screen.queryByText(t.edit)).not.toBeInTheDocument();
    expect(screen.queryByText(t.save)).not.toBeInTheDocument();
  });

  it("al editar habilita los campos de esa fila", async () => {
    const user = userEvent.setup();
    renderModal({ deductionsCollection: deductions });

    expect(screen.queryByRole("textbox", { name: t.deductionDescription })).not.toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: t.editDeductionAria })[0]);

    expect(screen.getByRole("textbox", { name: t.deductionDescription })).toHaveValue("Almuerzo");
    expect(screen.getByRole("textbox", { name: t.amount })).toHaveValue("$15.000");
    expect(screen.getByRole("button", { name: t.saveDeductionAria })).toBeInTheDocument();
  });
});
