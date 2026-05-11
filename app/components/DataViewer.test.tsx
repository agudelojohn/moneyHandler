import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import DataViewer from "@/app/components/DataViewer";
import { translations } from "@/app/i18n/translations";
import { renderWithProviders } from "@/test/test-utils";

describe("DataViewer", () => {
  afterEach(() => {
    cleanup();
  });

  it("muestra totales y días según props", () => {
    const start = new Date(2026, 0, 1);
    renderWithProviders(
      <DataViewer
        totalValue={1_000_000}
        startDay={start}
        environment="production"
        initialTodayDate="2026-01-15"
      />,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(translations.es.dataViewer.title);
    expect(screen.getByText(new RegExp(`${translations.es.dataViewer.totalValue}:`))).toBeInTheDocument();
    expect(screen.getByText(/1.?000.?000/)).toBeInTheDocument();
  });

  it("en desarrollo muestra botones para ajustar el día", async () => {
    const user = userEvent.setup();
    const start = new Date(2026, 0, 1);
    renderWithProviders(
      <DataViewer
        totalValue={0}
        startDay={start}
        environment="development"
        initialTodayDate="2026-01-15"
      />,
    );

    await user.click(screen.getByRole("button", { name: translations.es.dataViewer.plusOneDay }));
    expect(screen.getByRole("button", { name: translations.es.dataViewer.minusOneDay })).toBeInTheDocument();
  });
});
