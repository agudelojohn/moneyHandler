import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ListStaticPaymentsModal } from "@/app/management/components/ListStaticPaymentsModal";
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

describe("ListStaticPaymentsModal", () => {
  it("muestra el diálogo de pagos estáticos", () => {
    renderWithProviders(
      <ListStaticPaymentsModal
        managementRecord={record}
        openStaticPaymentsModal
        setOpenStaticPaymentsModal={vi.fn()}
        currencyFormatter={new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" })}
        fetchRecordsByDate={vi.fn()}
        baseRequestDate="2026-01-01"
        activeUserId="6b7b7b40"
        categoryId="GASTOS"
      />,
    );

    expect(screen.getByText(translations.es.management.listStaticPaymentsTitle)).toBeInTheDocument();
  });

  it("abre el pago fijo nuevo justo debajo del botón de agregar", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ListStaticPaymentsModal
        managementRecord={{
          ...record,
          staticPayments: [
            { description: "Arriendo", amount: 1000, isCredit: false, isPayed: false, paymentDay: null },
            { description: "Internet", amount: 500, isCredit: false, isPayed: false, paymentDay: null },
          ],
        }}
        openStaticPaymentsModal
        setOpenStaticPaymentsModal={vi.fn()}
        currencyFormatter={new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" })}
        fetchRecordsByDate={vi.fn()}
        baseRequestDate="2026-01-01"
        activeUserId="6b7b7b40"
        categoryId="GASTOS"
      />,
    );

    const addButton = screen.getByRole("button", { name: translations.es.management.addStaticPayment });
    await user.click(addButton);

    const description = screen.getByLabelText(translations.es.management.deductionDescription);
    const firstExisting = screen.getByText("Arriendo");
    expect(addButton.compareDocumentPosition(description) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(description.compareDocumentPosition(firstExisting) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
