import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Providers from "@/app/providers";
import { I18nProvider } from "@/app/i18n/I18nProvider";
import { translations } from "@/app/i18n/translations";
import { render } from "@testing-library/react";

describe("Providers", () => {
  it("renderiza hijos dentro del árbol MUI y sesión", () => {
    render(
      <Providers>
        <I18nProvider>
          <span>{translations.es.home.title}</span>
        </I18nProvider>
      </Providers>,
    );

    expect(screen.getByText(translations.es.home.title)).toBeInTheDocument();
  });
});
