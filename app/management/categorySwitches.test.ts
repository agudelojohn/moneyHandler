import { describe, expect, it } from "vitest";
import { EXPENSES_CATEGORY_ID } from "@/lib/aws/schemas/common";
import { defaultCategorySwitches, normalizeCategorySwitches } from "./categorySwitches";

describe("defaultCategorySwitches", () => {
  it("apaga todos los switches cuando no hay fila guardada", () => {
    expect(defaultCategorySwitches(EXPENSES_CATEGORY_ID)).toEqual({ dailyConfiguration: false });
    expect(defaultCategorySwitches("AHORROS")).toEqual({ dailyConfiguration: false });
  });

  it("respeta un booleano guardado y cae al default si la clave no es booleana", () => {
    expect(normalizeCategorySwitches("AHORROS", { dailyConfiguration: true }).dailyConfiguration).toBe(true);
    expect(normalizeCategorySwitches(EXPENSES_CATEGORY_ID, { dailyConfiguration: "si" }).dailyConfiguration).toBe(false);
    expect(normalizeCategorySwitches("AHORROS", null).dailyConfiguration).toBe(false);
  });
});
