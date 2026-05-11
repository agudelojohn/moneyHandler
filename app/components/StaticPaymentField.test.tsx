import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import StaticPaymentField from "@/app/components/StaticPaymentField";
import { translations } from "@/app/i18n/translations";
import { renderWithProviders } from "@/test/test-utils";

describe("StaticPaymentField", () => {
  it("muestra la descripción y el monto y notifica cambios", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onDelete = vi.fn();

    renderWithProviders(
      <StaticPaymentField
        payment={{ description: "Arriendo", amount: 500000, isCredit: false, isPayed: false, paymentDay: null }}
        onChange={onChange}
        onDelete={onDelete}
      />,
    );

    const descLabel = translations.es.management.deductionDescription;
    const amountLabel = translations.es.management.deductionAmount;

    expect(screen.getByLabelText(descLabel)).toHaveValue("Arriendo");
    expect(screen.getByLabelText(amountLabel)).toHaveValue(500000);

    await user.clear(screen.getByLabelText(descLabel));
    await user.type(screen.getByLabelText(descLabel), "Nuevo");
    expect(onChange).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: translations.es.management.deleteDeductionAria }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
