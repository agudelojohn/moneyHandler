import type { Deduction } from "../types";

export function sumCreditAmounts(deductions: Deduction[]): number {
    return deductions.reduce((sum, item) => (item.isCredit ? sum + item.amount : sum), 0);
}

export function sumUnpaidCreditAmounts(deductions: Deduction[]): number {
    return deductions.reduce(
        (sum, item) => (item.isCredit && !item.isPayed ? sum + item.amount : sum),
        0,
    );
}
