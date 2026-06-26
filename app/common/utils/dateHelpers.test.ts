import { describe, expect, it } from "vitest";
import {
  getDateFromDateString,
  isValidDateRangeOrder,
  localCalendarDayToUtcIso,
  parseStoredDateValue,
  parseUtcIsoDate,
  utcIsoToLocalCalendarDay,
} from "./dateHelpers";

describe("dateHelpers UTC/local", () => {
  it("convierte un día local a ISO UTC y viceversa", () => {
    const iso = localCalendarDayToUtcIso("2026-05-28");
    expect(iso).toBe(getDateFromDateString("2026-05-28").toISOString());
    expect(utcIsoToLocalCalendarDay(iso)).toBe("2026-05-28");
  });

  it("soporta fin de día local en UTC", () => {
    const endIso = localCalendarDayToUtcIso("2026-05-28", true);
    const endDate = new Date(endIso);
    const startDate = getDateFromDateString("2026-05-28");
    startDate.setHours(23, 59, 59, 999);
    expect(endDate.toISOString()).toBe(startDate.toISOString());
  });

  it("parsea ISO almacenado para mostrar en calendario local", () => {
    const iso = localCalendarDayToUtcIso("2026-05-28");
    const parsed = parseStoredDateValue(iso);
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(4);
    expect(parsed.getDate()).toBe(28);
  });

  it("parseUtcIsoDate acepta ISO y yyyy-mm-dd local", () => {
    const fromIso = parseUtcIsoDate(localCalendarDayToUtcIso("2026-01-15"));
    expect(fromIso.getDate()).toBe(15);
    const fromDateOnly = parseUtcIsoDate("2026-01-15");
    expect(fromDateOnly.getDate()).toBe(15);
  });

  it("valida que la fecha final no sea anterior a la inicial", () => {
    expect(isValidDateRangeOrder("2026-01-01", "2026-01-31")).toBe(true);
    expect(isValidDateRangeOrder("2026-01-15", "2026-01-15")).toBe(true);
    expect(isValidDateRangeOrder("2026-01-31", "2026-01-01")).toBe(false);
  });
});
