import {
    getDateFromDateString,
    getElapsedDaysInRange,
    getInclusiveDaysBetween,
} from "@/app/common/utils/dateHelpers";
import type { CategorySwitches } from "../categorySwitches";
import type { ManagementRecord } from "../types";

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

export type ManagementRecordView = {
    staticPaymentsTotal: number;
    staticPaymentsPaidTotal: number;
    deductionTotal: number;
    expectedPocket: number;
    figures: ManagementFigures;
};

type AmountItem = { amount: number };
type PaidAmountItem = AmountItem & { isPayed: boolean };

export function sumAmounts(items: AmountItem[]): number {
    return items.reduce((sum, item) => sum + item.amount, 0);
}

export function sumPaidAmounts(items: PaidAmountItem[]): number {
    return items.reduce((sum, item) => (item.isPayed ? sum + item.amount : sum), 0);
}

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

export function buildManagementRecordView(
    record: Pick<
        ManagementRecord,
        "initialAmount" | "staticPayments" | "deductions" | "startDate" | "endDate" | "creationDate"
    >,
    baseRequestDate: string,
    switches: CategorySwitches,
): ManagementRecordView {
    const staticPaymentsTotal = sumAmounts(record.staticPayments);
    const staticPaymentsPaidTotal = sumPaidAmounts(record.staticPayments);
    const deductionTotal = sumAmounts(record.deductions);
    const referenceDate = getDateFromDateString(baseRequestDate);
    const startDate = new Date(record.startDate ?? record.creationDate);
    const endDate = new Date(record.endDate ?? record.creationDate);
    const figures = buildManagementFigures(
        {
            initialAmount: record.initialAmount,
            staticPaymentsTotal,
            deductionTotal,
            totalDaysInRange: getInclusiveDaysBetween(startDate, endDate),
            elapsedDays: getElapsedDaysInRange(referenceDate, startDate, endDate),
        },
        switches,
    );

    return {
        staticPaymentsTotal,
        staticPaymentsPaidTotal,
        deductionTotal,
        expectedPocket: record.initialAmount - deductionTotal - staticPaymentsPaidTotal,
        figures,
    };
}

export function availableAmountFromRecord(
    record: Pick<
        ManagementRecord,
        "initialAmount" | "staticPayments" | "deductions" | "startDate" | "endDate" | "creationDate"
    >,
    baseRequestDate: string,
    switches: CategorySwitches,
): number {
    return buildManagementRecordView(record, baseRequestDate, switches).figures.availableAmount;
}
