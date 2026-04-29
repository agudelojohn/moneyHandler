export function parseDatePreservingCalendarDay(date: string): Date {
    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(date);
    const isUtcMidnightIso = /^\d{4}-\d{2}-\d{2}T00:00:00\.000Z$/.test(date);

    if (isDateOnly || isUtcMidnightIso) {
        const [year, month, day] = date.slice(0, 10).split("-").map(Number);
        return new Date(year, month - 1, day);
    }

    return new Date(date);
}