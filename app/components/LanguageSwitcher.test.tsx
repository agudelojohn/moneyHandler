import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import { translations } from "@/app/i18n/translations";
import { renderWithProviders } from "@/test/test-utils";

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("cambia el idioma a inglés y persiste en localStorage", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LanguageSwitcher />);

    expect(screen.getByText(translations.es.common.language)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "EN" }));

    await waitFor(() => {
      expect(window.localStorage.getItem("moneyhandler-locale")).toBe("en");
      expect(screen.getByText(translations.en.common.language)).toBeInTheDocument();
    });
  });
});
