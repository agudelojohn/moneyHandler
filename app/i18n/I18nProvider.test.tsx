import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider, useI18n } from "@/app/i18n/I18nProvider";
import { translations } from "@/app/i18n/translations";

function LocaleEcho() {
  const { t } = useI18n();
  return <span>{t.home.title}</span>;
}

describe("I18nProvider", () => {
  it("lanza si useI18n se usa fuera del proveedor", () => {
    expect(() => render(<LocaleEcho />)).toThrow(/useI18n must be used inside I18nProvider/);
  });

  it("aplica el idioma guardado en localStorage", async () => {
    window.localStorage.setItem("moneyhandler-locale", "en");

    render(
      <I18nProvider>
        <LocaleEcho />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(translations.en.home.title)).toBeInTheDocument();
    });

    window.localStorage.removeItem("moneyhandler-locale");
  });
});
