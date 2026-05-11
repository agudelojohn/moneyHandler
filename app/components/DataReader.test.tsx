import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DataReader from "@/app/components/DataReader";
import { VALUE_KEYS } from "@/app/common/utils/constants";
import { fetchSheetData } from "@/app/common/utils/index";
import { renderWithProviders } from "@/test/test-utils";

vi.mock("@/app/common/utils/index", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/app/common/utils/index")>();
  return {
    ...actual,
    fetchSheetData: vi.fn(),
  };
});

describe("DataReader", () => {
  beforeEach(() => {
    vi.mocked(fetchSheetData).mockReset();
  });

  it("renderiza DataViewer con datos obtenidos de la hoja", async () => {
    vi.mocked(fetchSheetData).mockResolvedValue({
      values: [
        [VALUE_KEYS.MONTH_START, VALUE_KEYS.START_DATE],
        [2_500_000, 45_000],
      ],
    });

    const ui = await DataReader();
    renderWithProviders(ui);

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/2.?500.?000/)).toBeInTheDocument();
  });
});
