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
import { useUserSession } from "./userSession";
import {
    listCategoryConfigs,
    updateCategoryConfig,
} from "../management/services/categoryConfigApi";
import {
    defaultCategorySwitches,
    type CategoryConfig,
    type CategorySwitches,
} from "../management/categorySwitches";

type CategoryConfigContextValue = {
    configs: CategoryConfig[];
    isLoading: boolean;
    error: string | null;
    getSwitches: (categoryId: string) => CategorySwitches;
    saveSwitches: (categoryId: string, switches: CategorySwitches) => Promise<void>;
    reload: () => Promise<void>;
};

const CategoryConfigContext = createContext<CategoryConfigContextValue | null>(null);

export function CategoryConfigProvider({ children }: { children: ReactNode }) {
    const { activeUser } = useUserSession();
    const [configs, setConfigs] = useState<CategoryConfig[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!activeUser) {
            setConfigs([]);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const data = await listCategoryConfigs(activeUser.userId);
            setConfigs(data);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "No se pudo cargar la configuración de categorías");
            setConfigs([]);
        } finally {
            setIsLoading(false);
        }
    }, [activeUser]);

    useEffect(() => {
        // Carga la última configuración al montar o al cambiar de usuario.
        // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch al montar
        void load();
    }, [load]);

    const getSwitches = useCallback((categoryId: string) => {
        return configs.find((config) => config.categoryId === categoryId)?.switches
            ?? defaultCategorySwitches(categoryId);
    }, [configs]);

    const saveSwitches = useCallback(async (categoryId: string, switches: CategorySwitches) => {
        if (!activeUser) {
            throw new Error("Debes seleccionar un usuario en la pantalla principal.");
        }

        const saved = await updateCategoryConfig(categoryId, switches, activeUser.userId);
        setConfigs((previous) => {
            const withoutCurrent = previous.filter((config) => config.categoryId !== categoryId);
            return [...withoutCurrent, saved];
        });
    }, [activeUser]);

    const value = useMemo<CategoryConfigContextValue>(
        () => ({ configs, isLoading, error, getSwitches, saveSwitches, reload: load }),
        [configs, isLoading, error, getSwitches, saveSwitches, load]
    );

    return <CategoryConfigContext.Provider value={value}>{children}</CategoryConfigContext.Provider>;
}

export function useCategoryConfig() {
    const context = useContext(CategoryConfigContext);
    if (!context) {
        throw new Error("useCategoryConfig must be used inside CategoryConfigProvider");
    }
    return context;
}
