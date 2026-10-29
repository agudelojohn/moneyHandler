import { describe, expect, it } from "vitest";
import { availableAmountFromRecord, buildManagementFigures } from "./recordFigures";

const input = {
  initialAmount: 1000,
  staticPaymentsTotal: 200,
  deductionTotal: 50,
  totalDaysInRange: 10,
  elapsedDays: 4,
};

describe("buildManagementFigures", () => {
  it("Divide el valor disponible y expone los campos diarios cuando la configuración diaria está encendida", () => {
    expect(buildManagementFigures(input, { dailyConfiguration: true })).toEqual({
      availableAmount: 270,
      dailyAvailableAmount: 80,
      totalDaysInRange: 10,
      elapsedDays: 4,
    });
  });

  it("usa la fórmula simple y oculta los campos diarios cuando la configuración diaria está apagada", () => {
    expect(buildManagementFigures(input, { dailyConfiguration: false })).toEqual({
      availableAmount: 750,
      dailyAvailableAmount: null,
      totalDaysInRange: null,
      elapsedDays: null,
    });
  });

  it("evita dividir entre cero cuando el rango no tiene días", () => {
    expect(buildManagementFigures(
      { ...input, totalDaysInRange: 0 },
      { dailyConfiguration: true },
    ).dailyAvailableAmount).toBe(0);
  });
});

describe("availableAmountFromRecord", () => {
  it("resta pagos fijos y deducciones del ultimo registro", () => {
    expect(availableAmountFromRecord(
      {
        initialAmount: 1000,
        creationDate: "2026-01-01T00:00:00.000Z",
        startDate: "2026-01-01T00:00:00.000Z",
        endDate: "2026-01-31T00:00:00.000Z",
        deductions: [{ description: "Cafe", amount: 100, isCredit: false, isPayed: false }],
        staticPayments: [
          { description: "Arriendo", amount: 200, isCredit: false, isPayed: false, paymentDay: null },
        ],
      },
      "2026-02-01",
      { dailyConfiguration: false },
    )).toBe(700);
  });
});
