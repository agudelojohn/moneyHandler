import type { CategorySwitches } from "./categorySwitches";

export type ManagementFiguresInput = {
    initialAmount: number;
    staticPaymentsTotal: number;
    deductionTotal: number;
    totalDaysInRange: number;
    elapsedDays: number;
};

export type ManagementFigures = {
    availableAmount: number;
    dailyAvailableAmount: number | null;
    totalDaysInRange: number | null;
    elapsedDays: number | null;
};

export function buildManagementFigures(
    input: ManagementFiguresInput,
    switches: CategorySwitches,
): ManagementFigures {
    if (!switches.dailyConfiguration) {
        return {
            availableAmount: input.initialAmount - input.staticPaymentsTotal - input.deductionTotal,
            dailyAvailableAmount: null,
            totalDaysInRange: null,
            elapsedDays: null,
        };
    }

    const dailyAvailableAmount = input.totalDaysInRange === 0
        ? 0
        : (input.initialAmount - input.staticPaymentsTotal) / input.totalDaysInRange;

    return {
        availableAmount: dailyAvailableAmount * input.elapsedDays - input.deductionTotal,
        dailyAvailableAmount,
        totalDaysInRange: input.totalDaysInRange,
        elapsedDays: input.elapsedDays,
    };
}
