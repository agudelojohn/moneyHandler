const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24

export const normalizeDate = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())

export const getLastBusinessDayOfMonth = (baseDate: Date) => {
  const lastDay = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0)

  while (lastDay.getDay() === 0 || lastDay.getDay() === 6) {
    lastDay.setDate(lastDay.getDate() - 1)
  }

  return normalizeDate(lastDay)
}

export const getInclusiveDaysDiff = (startDate: Date, endDate: Date) => {
  const normalizedStartDate = normalizeDate(startDate)
  const normalizedEndDate = normalizeDate(endDate)
  const diff = Math.abs(normalizedEndDate.getTime() - normalizedStartDate.getTime())

  return Math.floor(diff / MILLISECONDS_PER_DAY) + 1
}

export const setDateToStartOfDay = (date: Date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export const setDateToEndOfDay = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export const formatDateAsYyyyMmDd = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = getDateFromDateString(value);
  return !Number.isNaN(date.getTime());
}

/** Medianoche local del día `yyyy-mm-dd` en el dispositivo. */
export function getDateFromDateString(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

/**
 * Convierte un día de calendario local (`yyyy-mm-dd`) a ISO UTC para persistencia.
 * Opcionalmente usa el final del día local (23:59:59.999).
 */
export function localCalendarDayToUtcIso(dateOnly: string, endOfDay = false): string {
  const date = getDateFromDateString(dateOnly);
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  }
  return date.toISOString();
}

/** Convierte un instante UTC almacenado a `yyyy-mm-dd` en la zona horaria del dispositivo. */
export function utcIsoToLocalCalendarDay(iso: string): string {
  return formatDateAsYyyyMmDd(new Date(iso));
}

/** Parsea ISO UTC (o `yyyy-mm-dd` como día local) a `Date` para mostrar en el dispositivo. */
export function parseStoredDateValue(value: string): Date {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return getDateFromDateString(trimmed);
  }
  return new Date(trimmed);
}

/** Parsea entradas ISO UTC desde la API; lanza si la fecha es inválida. */
export function parseUtcIsoDate(value: string): Date {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return getDateFromDateString(trimmed);
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new RangeError(`Invalid date: ${value}`);
  }
  return parsed;
}

export function normalizeDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getInclusiveDaysBetween(startDate: Date, endDate: Date): number {
  const start = normalizeDateOnly(startDate).getTime();
  const end = normalizeDateOnly(endDate).getTime();
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((end - start) / millisecondsPerDay) + 1;
}

export function getElapsedDaysInRange(referenceDate: Date, startDate: Date, endDate: Date): number {
  const normalizedReference = normalizeDateOnly(referenceDate);
  const normalizedStart = normalizeDateOnly(startDate);
  const normalizedEnd = normalizeDateOnly(endDate);

  if (normalizedReference.getTime() < normalizedStart.getTime()) {
    return 0;
  }

  if (normalizedReference.getTime() > normalizedEnd.getTime()) {
    return getInclusiveDaysBetween(normalizedStart, normalizedEnd);
  }

  return getInclusiveDaysBetween(normalizedStart, normalizedReference);
}

const longDateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDateWithMonthName(date: Date): string {
  return longDateFormatter.format(date);
}
