"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useCategories } from "../common/categoriesSession";
import { useUserSession } from "../common/userSession";
import { EXPENSES_CATEGORY_ID } from "@/lib/aws/schemas/common";
import { AppTour } from "./AppTour";
import { hasSeenTour, markTourSeen } from "./tourStorage";
import { TOUR_STEPS, type TourRouteKind } from "./steps";

type TourContextValue = {
    startTour: () => void;
};

const TourContext = createContext<TourContextValue | null>(null);

export function useTour() {
    const value = useContext(TourContext);
    if (!value) {
        throw new Error("useTour must be used inside TourProvider");
    }
    return value;
}

function routeFor(kind: TourRouteKind, categoryId: string | null) {
    if (kind === "home") {
        return "/";
    }
    if (kind === "management") {
        return "/management";
    }
    if (kind === "expenses") {
        return "/expenses";
    }
    return categoryId ? `/management?category=${encodeURIComponent(categoryId)}` : "/management";
}

export function TourProvider({ children }: { children: ReactNode }) {
    const { activeUser } = useUserSession();
    const { categories } = useCategories();
    const router = useRouter();
    const pathname = usePathname();
    const [replay, setReplay] = useState(false);
    const [hiddenForUserId, setHiddenForUserId] = useState<string | null>(null);
    const [index, setIndex] = useState(0);

    const open = replay || Boolean(
        activeUser &&
        hiddenForUserId !== activeUser.userId &&
        !hasSeenTour(activeUser.userId)
    );
    const [wasOpen, setWasOpen] = useState(open);
    if (open !== wasOpen) {
        setWasOpen(open);
        if (open) {
            setIndex(0);
        }
    }

    const categoryId = categories.some((category) => category.id === EXPENSES_CATEGORY_ID)
        ? EXPENSES_CATEGORY_ID
        : categories[0]?.id ?? null;
    const route = routeFor(TOUR_STEPS[index]?.route ?? "home", categoryId);

    useEffect(() => {
        if (!open) {
            return;
        }
        const here = window.location.pathname + window.location.search;
        if (here !== route) {
            router.push(route);
        }
    }, [open, route, pathname, router]);

    function closeTour() {
        if (activeUser) {
            markTourSeen(activeUser.userId);
            setHiddenForUserId(activeUser.userId);
        }
        setReplay(false);
    }

    function goNext() {
        if (index >= TOUR_STEPS.length - 1) {
            closeTour();
            return;
        }
        setIndex(index + 1);
    }

    const value = useMemo<TourContextValue>(() => ({
        startTour: () => setReplay(true),
    }), []);

    return (
        <TourContext.Provider value={value}>
            {children}
            <AppTour
                open={open}
                index={index}
                onNext={goNext}
                onBack={() => setIndex((current) => Math.max(0, current - 1))}
                onClose={closeTour}
            />
        </TourContext.Provider>
    );
}
