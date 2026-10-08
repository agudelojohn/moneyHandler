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

  it("guarda el monto inicial como entero aunque se vea en pesos", async () => {
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

    const amountInput = screen.getByLabelText(translations.es.management.initialAmount);
    await user.type(amountInput, "500000");
    expect(amountInput).toHaveValue("$500.000");

    await user.click(screen.getByRole("button", { name: translations.es.expenses.createRecord }));

    expect(managementApi.createManagementRecord).toHaveBeenCalledWith(
      expect.objectContaining({ initialAmount: 500000, categoryId: "GASTOS" }),
      "6b7b7b40",
    );
  });

  it("copia los pagos fijos del ultimo registro sin marcarlos pagados", async () => {
    const user = userEvent.setup();
    vi.spyOn(managementApi, "getLatestManagementRecord").mockResolvedValue({
      id: "prev",
      categoryId: "GASTOS",
      initialAmount: 1000,
      creationDate: "2026-01-01T00:00:00.000Z",
      startDate: "2026-01-01T00:00:00.000Z",
      endDate: "2026-01-31T00:00:00.000Z",
      deductions: [],
      staticPayments: [
        {
          description: "Arriendo",
          amount: 800000,
          isCredit: false,
          isPayed: true,
          paymentDay: "2026-01-15T00:00:00.000Z",
        },
      ],
    });

    renderWithProviders(
      <CreateManagementModal
        openCreateModal
        setOpenCreateModal={vi.fn()}
        fetchRecordsByDate={vi.fn()}
        baseRequestDate="2026-02-01"
        activeUserId="6b7b7b40"
        categoryId="GASTOS"
        suggestedRangeDate={null}
      />,
    );

    await user.click(screen.getByRole("button", { name: translations.es.management.copyLatestStaticPayments }));
    expect(screen.getByDisplayValue("Arriendo")).toBeInTheDocument();

    await user.type(screen.getByLabelText(translations.es.management.initialAmount), "500000");
    await user.click(screen.getByRole("button", { name: translations.es.expenses.createRecord }));

    expect(managementApi.createManagementRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        staticPayments: [
          {
            description: "Arriendo",
            amount: 800000,
            isCredit: false,
            isPayed: false,
            paymentDay: null,
          },
        ],
      }),
      "6b7b7b40",
    );
  });

  it("avisa y conserva lo escrito cuando el ultimo registro no tiene pagos fijos", async () => {
    const user = userEvent.setup();
    vi.spyOn(managementApi, "getLatestManagementRecord").mockResolvedValue(null);

    renderWithProviders(
      <CreateManagementModal
        openCreateModal
        setOpenCreateModal={vi.fn()}
        fetchRecordsByDate={vi.fn()}
        baseRequestDate="2026-02-01"
        activeUserId="6b7b7b40"
        categoryId="GASTOS"
        suggestedRangeDate={null}
      />,
    );

    await user.click(screen.getByRole("button", { name: translations.es.management.addStaticPayment }));
    const description = screen.getByLabelText(translations.es.management.deductionDescription);
    await user.type(description, "Manual");

    await user.click(screen.getByRole("button", { name: translations.es.management.copyLatestStaticPayments }));

    expect(screen.getByText(translations.es.management.noPreviousStaticPayments)).toBeInTheDocument();
    expect(screen.getByDisplayValue("Manual")).toBeInTheDocument();
  });
});
