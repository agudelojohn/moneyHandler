"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useUserSession, withUserIdHeader } from "./userSession";
import { listCategories } from "../management/services/categoriesApi";
import type { UserCategory } from "@/lib/aws/schemas/categorySchema";

type CategoriesContextValue = {
  categories: UserCategory[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const { activeUser } = useUserSession();
  const [categories, setCategories] = useState<UserCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!activeUser) {
      setCategories([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await listCategories(activeUser.userId);
      setCategories(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar las categorías");
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeUser]);

  useEffect(() => {
    void load();
  }, [load]);

  const value = useMemo<CategoriesContextValue>(
    () => ({ categories, isLoading, error, reload: load }),
    [categories, isLoading, error, load]
  );

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories must be used inside CategoriesProvider");
  }
  return context;
}

// `withUserIdHeader` se re-exporta por conveniencia para consumidores que ya
// importan desde este módulo.
export { withUserIdHeader };
