import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { TourProvider } from "@/app/tour/TourProvider";
import { translations } from "@/app/i18n/translations";
import { renderWithProviders } from "@/test/test-utils";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => ({ get: () => null }),
}));

function renderHome() {
  return renderWithProviders(
    <TourProvider>
      <Home />
    </TourProvider>,
  );
}

describe("Home (page)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("muestra el título principal", () => {
    renderHome();
    expect(screen.getByText(translations.es.home.title)).toBeInTheDocument();
  });

  it("abre el tour la primera vez que Alejo entra y lo marca al saltarlo", async () => {
    const user = userEvent.setup();
    window.sessionStorage.setItem("money-handler-active-user", "alejo");
    renderHome();

    expect(await screen.findByText(translations.es.tour.welcomeTitle)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: translations.es.tour.next }));
    expect(screen.getByText(translations.es.tour.modulesTitle)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: translations.es.tour.skip }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(window.localStorage.getItem("money-handler-tour-seen:6b7b7b40")).toBe("1");
  });

  it("no abre el tour si ese usuario ya lo vio, y el boton lo vuelve a mostrar", async () => {
    const user = userEvent.setup();
    window.sessionStorage.setItem("money-handler-active-user", "clau");
    window.localStorage.setItem("money-handler-tour-seen:8cfdbf65", "1");
    renderHome();

    expect(await screen.findByRole("button", { name: translations.es.tour.replay })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: translations.es.tour.replay }));
    expect(screen.getByText(translations.es.tour.welcomeTitle)).toBeInTheDocument();
  });
});
