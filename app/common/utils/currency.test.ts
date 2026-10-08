import { describe, expect, it } from "vitest";
import { amountToDigits, formatCopDigits, parseCopDigits } from "./currency";

describe("formato de pesos colombianos", () => {
  it("agrupa miles con punto y antepone $", () => {
    expect(formatCopDigits("500000")).toBe("$500.000");
    expect(formatCopDigits("1000000")).toBe("$1.000.000");
    expect(formatCopDigits("15000")).toBe("$15.000");
    expect(formatCopDigits("500")).toBe("$500");
    expect(formatCopDigits("0")).toBe("$0");
  });

  it("ignora separadores y símbolos al leer un monto", () => {
    expect(parseCopDigits("$500.000")).toBe("500000");
    expect(parseCopDigits("500.000")).toBe("500000");
    expect(parseCopDigits("500000")).toBe("500000");
    expect(parseCopDigits("")).toBe("");
    expect(parseCopDigits("abc")).toBe("");
    expect(parseCopDigits("00500")).toBe("500");
    expect(parseCopDigits("0")).toBe("0");
  });

  it("normaliza números y textos vacíos", () => {
    expect(amountToDigits(500000)).toBe("500000");
    expect(amountToDigits(0)).toBe("0");
    expect(amountToDigits("")).toBe("");
    expect(amountToDigits("$15.000")).toBe("15000");
  });
});
