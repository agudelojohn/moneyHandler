export type TourRouteKind = "home" | "management" | "detail" | "expenses";

export type TourStepDefinition = {
    id: string;
    targets: string[];
    route: TourRouteKind;
};

export const TOUR_STEPS: TourStepDefinition[] = [
    { id: "welcome", targets: ["active-user"], route: "home" },
    { id: "modules", targets: ["home-management"], route: "home" },
    { id: "categories", targets: ["category-list"], route: "management" },
    { id: "record", targets: ["manage-categories"], route: "management" },
    { id: "daily", targets: ["category-settings"], route: "detail" },
    { id: "staticPayments", targets: ["static-payments", "management-workspace"], route: "detail" },
    { id: "deductions", targets: ["add-deduction", "management-workspace"], route: "detail" },
    { id: "expenses", targets: ["expenses-chart"], route: "expenses" },
    { id: "expensesForm", targets: ["expenses-form"], route: "expenses" },
];

export function findVisibleTarget(names: string[]): HTMLElement | null {
    for (const name of names) {
        const nodes = document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`);
        for (const node of nodes) {
            const rect = node.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                return node;
            }
        }
    }
    return null;
}
