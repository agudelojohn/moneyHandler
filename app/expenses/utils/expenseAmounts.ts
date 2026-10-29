type ExpenseAmountItem = {
    amount: number | string;
    description: string;
};

export function normalizeDescriptionKey(value: string): string {
    return value.toLowerCase().replaceAll(" ", "");
}

export function sumExpenseAmounts(items: { amount: number | string }[]): number {
    return items.reduce((sum, item) => sum + Number(item.amount), 0);
}

export function groupAmountsByDescription(
    items: ExpenseAmountItem[],
): Map<string, { label: string; amount: number }> {
    const grouped = new Map<string, { label: string; amount: number }>();

    for (const item of items) {
        const key = normalizeDescriptionKey(item.description);
        const current = grouped.get(key);
        const amount = Number(item.amount);
        grouped.set(
            key,
            current
                ? { ...current, amount: current.amount + amount }
                : { label: item.description, amount },
        );
    }

    return grouped;
}
