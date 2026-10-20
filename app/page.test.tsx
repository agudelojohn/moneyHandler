import { cleanup, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppRouterContext, type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Home from "@/app/page";
import { translations } from "@/app/i18n/translations";
import { renderWithProviders } from "@/test/test-utils";

const t = translations.es.home;

const { mockReplace } = vi.hoisted(() => ({
  mockReplace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: mockReplace,
    prefetch: vi.fn(),
  }),
}));

const mockRouter = {
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  push: vi.fn(),
  replace: mockReplace,
  prefetch: vi.fn(),
  bfcacheId: "_b_0_",
} satisfies AppRouterInstance;

function renderHome() {
  return renderWithProviders(
    <AppRouterContext.Provider value={mockRouter}>
      <Home />
    </AppRouterContext.Provider>,
  );
}

describe("Home (page)", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    window.sessionStorage.clear();
    mockReplace.mockClear();
  });

  it("muestra el título principal", () => {
    renderHome();
    expect(screen.getByText(t.title)).toBeInTheDocument();
  });

  it("muestra ambos módulos cuando las flags están encendidas", () => {
    vi.stubEnv("NEXT_PUBLIC_FEATURE_MANAGEMENT", "true");
    vi.stubEnv("NEXT_PUBLIC_FEATURE_EXPENSES", "true");

    renderHome();

    expect(screen.getByText(t.managementButton)).toBeInTheDocument();
    expect(screen.getByText(t.expensesButton)).toBeInTheDocument();
    expect(screen.queryByText(t.noActiveModules)).not.toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("no redirige ni muestra el botón de módulo si solo hay una flag y no hay usuario", () => {
    vi.stubEnv("NEXT_PUBLIC_FEATURE_MANAGEMENT", "true");
    vi.stubEnv("NEXT_PUBLIC_FEATURE_EXPENSES", "false");

    renderHome();

    expect(screen.getByText(t.title)).toBeInTheDocument();
    expect(screen.queryByText(t.managementButton)).not.toBeInTheDocument();
    expect(screen.queryByText(t.expensesButton)).not.toBeInTheDocument();
    expect(screen.queryByText(t.noActiveModules)).not.toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("redirige a /management si solo management está activo y hay usuario", async () => {
    vi.stubEnv("NEXT_PUBLIC_FEATURE_MANAGEMENT", "true");
    vi.stubEnv("NEXT_PUBLIC_FEATURE_EXPENSES", "false");
    window.sessionStorage.setItem("money-handler-active-user", "alejo");

    renderHome();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/management");
    });
    expect(screen.queryByText(t.managementButton)).not.toBeInTheDocument();
  });

  it("redirige a /expenses si solo expenses está activo y hay usuario", async () => {
    vi.stubEnv("NEXT_PUBLIC_FEATURE_MANAGEMENT", "false");
    vi.stubEnv("NEXT_PUBLIC_FEATURE_EXPENSES", "true");
    window.sessionStorage.setItem("money-handler-active-user", "alejo");

    renderHome();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/expenses");
    });
    expect(screen.queryByText(t.expensesButton)).not.toBeInTheDocument();
  });

  it("muestra la vista vacía cuando todas las flags están apagadas", () => {
    vi.stubEnv("NEXT_PUBLIC_FEATURE_MANAGEMENT", "false");
    vi.stubEnv("NEXT_PUBLIC_FEATURE_EXPENSES", "false");

    renderHome();

    expect(screen.getByText(t.noActiveModules)).toBeInTheDocument();
    expect(screen.getByText(t.noActiveModulesDescription)).toBeInTheDocument();
    expect(screen.queryByText(t.managementButton)).not.toBeInTheDocument();
    expect(screen.queryByText(t.expensesButton)).not.toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
