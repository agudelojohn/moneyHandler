import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ManagementPage from "@/app/management/page";
import { translations } from "@/app/i18n/translations";
import { renderWithProviders } from "@/test/test-utils";

const mockGet = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => ({
    get: (key: string) => mockGet(key),
  }),
}));

describe("ManagementPage", () => {
  it("muestra la puerta de categorías si no hay query category", async () => {
    mockGet.mockReturnValue(null);

    renderWithProviders(<ManagementPage />);

    await waitFor(() => {
      expect(screen.getByText(translations.es.management.selectCategoryTitle)).toBeInTheDocument();
    });
  });
});
