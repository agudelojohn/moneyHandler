import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { MoneyTextField } from "@/app/components/MoneyTextField";
import { renderWithProviders } from "@/test/test-utils";

function Harness({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return <MoneyTextField label="Monto" value={value} onAmountChange={setValue} />;
}

describe("MoneyTextField", () => {
  it("muestra un monto guardado en pesos colombianos", () => {
    renderWithProviders(
      <MoneyTextField label="Monto" value={500000} onAmountChange={vi.fn()} />,
    );

    expect(screen.getByLabelText("Monto")).toHaveValue("$500.000");
  });

  it("formatea mientras se escribe y conserva solo los dígitos", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness />);

    const input = screen.getByLabelText("Monto");
    await user.type(input, "500000");

    expect(input).toHaveValue("$500.000");
  });

  it("ignora letras y símbolos", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness />);

    const input = screen.getByLabelText("Monto");
    await user.type(input, "50a0.000");

    expect(input).toHaveValue("$500.000");
  });

  it("permite reemplazar un cero", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness initial="0" />);

    const input = screen.getByLabelText("Monto");
    expect(input).toHaveValue("$0");

    await user.clear(input);
    await user.type(input, "1200");

    expect(input).toHaveValue("$1.200");
  });
});
