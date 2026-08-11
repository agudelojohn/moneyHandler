import { screen } from "@testing-library/react";
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
});
