import { parseUtcIsoDate } from "@/app/common/utils/dateHelpers";

/** @deprecated Usar `parseUtcIsoDate`; se mantiene por compatibilidad en rutas API. */
export function parseDatePreservingCalendarDay(date: string): Date {
    return parseUtcIsoDate(date);
}

export function toUtcStartOfCalendarDay(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function toUtcEndOfCalendarDay(date: Date): Date {
    return new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999)
    );
}
