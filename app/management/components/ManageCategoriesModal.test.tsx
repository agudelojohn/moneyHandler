import { cleanup, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ManageCategoriesModal from "@/app/management/components/ManageCategoriesModal";
import * as categoriesApi from "@/app/management/services/categoriesApi";
import type { UserCategory } from "@/lib/aws/schemas/categorySchema";
import { translations } from "@/app/i18n/translations";
import { renderWithProviders } from "@/test/test-utils";

const defaultCategories: UserCategory[] = [
  {
    id: "GASTOS",
    name: "Gastos",
    status: "active",
    isLocked: true,
    isDefault: true,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "VIAJES",
    name: "Viajes",
    status: "active",
    isLocked: false,
    isDefault: false,
    createdAt: "2026-01-02T00:00:00.000Z",
  },
];

const createdCategory: UserCategory = {
  id: "NUEVA",
  name: "Nueva",
  status: "active",
  isLocked: false,
  isDefault: false,
  createdAt: "2026-01-03T00:00:00.000Z",
};

describe("ManageCategoriesModal", () => {
  beforeEach(() => {
    sessionStorage.setItem("money-handler-active-user", "alejo");
    vi.spyOn(categoriesApi, "listCategories").mockResolvedValue(defaultCategories);
    vi.spyOn(categoriesApi, "createCategory").mockResolvedValue(createdCategory);
    vi.spyOn(categoriesApi, "renameCategory").mockResolvedValue({ ...defaultCategories[1], name: "Viajes editado" });
    vi.spyOn(categoriesApi, "deleteCategory").mockResolvedValue(undefined);
  });

  afterEach(() => {
    sessionStorage.clear();
    cleanup();
    vi.restoreAllMocks();
  });

  it("muestra la lista de categorías existentes", async () => {
    renderWithProviders(<ManageCategoriesModal open onClose={vi.fn()} />);

    expect(await screen.findByText("Viajes")).toBeInTheDocument();
    expect(screen.getByText(translations.es.categories.GASTOS)).toBeInTheDocument();
  });

  it("crea una categoría y recarga la lista", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ManageCategoriesModal open onClose={vi.fn()} />);
    await screen.findByText("Viajes");

    await user.type(
      screen.getByLabelText(translations.es.categoriesManager.newCategoryNameLabel),
      "Nueva"
    );
    await user.click(screen.getByRole("button", { name: translations.es.categoriesManager.addCategory }));

    await waitFor(() => {
      expect(categoriesApi.createCategory).toHaveBeenCalledWith("Nueva", "6b7b7b40");
    });
    await waitFor(() => {
      expect(categoriesApi.listCategories).toHaveBeenCalledTimes(2);
    });
  });

  it("rechaza crear una categoría duplicada", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ManageCategoriesModal open onClose={vi.fn()} />);
    await screen.findByText("Viajes");

    await user.type(
      screen.getByLabelText(translations.es.categoriesManager.newCategoryNameLabel),
      "VIAJES"
    );
    await user.click(screen.getByRole("button", { name: translations.es.categoriesManager.addCategory }));

    expect(await screen.findByText(translations.es.categoriesManager.duplicateCategoryError)).toBeInTheDocument();
    expect(categoriesApi.createCategory).not.toHaveBeenCalled();
  });

  it("rechaza crear una categoría con nombre vacío", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ManageCategoriesModal open onClose={vi.fn()} />);
    await screen.findByText("Viajes");

    await user.click(screen.getByRole("button", { name: translations.es.categoriesManager.addCategory }));

    expect(await screen.findByText(translations.es.categoriesManager.requiredCategoryNameError)).toBeInTheDocument();
    expect(categoriesApi.createCategory).not.toHaveBeenCalled();
  });

  it("renombra una categoría no bloqueada", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ManageCategoriesModal open onClose={vi.fn()} />);
    await screen.findByText("Viajes");

    await user.click(screen.getByRole("button", { name: translations.es.categoriesManager.renameCategoryAria }));

    const editInput = screen.getAllByRole("textbox")[1];
    await user.clear(editInput);
    await user.type(editInput, "Viajes editado");
    await user.click(screen.getByRole("button", { name: translations.es.categoriesManager.renameCategory }));

    await waitFor(() => {
      expect(categoriesApi.renameCategory).toHaveBeenCalledWith("VIAJES", "Viajes editado", "6b7b7b40");
    });
  });

  it("elimina una categoría tras confirmar", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ManageCategoriesModal open onClose={vi.fn()} />);
    await screen.findByText("Viajes");

    await user.click(screen.getByRole("button", { name: translations.es.categoriesManager.deleteCategoryAria }));
    await user.click(screen.getByRole("button", { name: translations.es.categoriesManager.deleteCategory }));

    await waitFor(() => {
      expect(categoriesApi.deleteCategory).toHaveBeenCalledWith("VIAJES", "6b7b7b40");
    });
  });

  it("no muestra acciones para categorías bloqueadas", async () => {
    renderWithProviders(<ManageCategoriesModal open onClose={vi.fn()} />);

    const gastosRow = (await screen.findByText(translations.es.categories.GASTOS)).closest(
      ".MuiStack-root"
    );
    expect(gastosRow).not.toBeNull();
    expect(within(gastosRow as HTMLElement).queryAllByRole("button")).toHaveLength(0);
  });
});
