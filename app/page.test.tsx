import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";
import { translations } from "@/app/i18n/translations";
import { renderWithProviders } from "@/test/test-utils";

describe("Home (page)", () => {
  it("muestra el título principal", () => {
    renderWithProviders(<Home />);
    expect(screen.getByText(translations.es.home.title)).toBeInTheDocument();
  });
});
