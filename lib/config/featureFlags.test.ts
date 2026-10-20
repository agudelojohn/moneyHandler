import { afterEach, describe, expect, it, vi } from "vitest";
import { getSoloHomeFeatureRoute, isHomeFeatureEnabled } from "./featureFlags";

describe("isHomeFeatureEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("enciende management por defecto si la variable no está definida", () => {
    delete process.env.NEXT_PUBLIC_FEATURE_MANAGEMENT;
    expect(isHomeFeatureEnabled("management")).toBe(true);
  });

  it("enciende expenses por defecto si la variable está vacía", () => {
    vi.stubEnv("NEXT_PUBLIC_FEATURE_EXPENSES", "");
    expect(isHomeFeatureEnabled("expenses")).toBe(true);
  });

  it("enciende la flag cuando vale true", () => {
    vi.stubEnv("NEXT_PUBLIC_FEATURE_MANAGEMENT", "true");
    expect(isHomeFeatureEnabled("management")).toBe(true);
  });

  it("apaga la flag cuando vale false", () => {
    vi.stubEnv("NEXT_PUBLIC_FEATURE_EXPENSES", "false");
    expect(isHomeFeatureEnabled("expenses")).toBe(false);
  });
});

describe("getSoloHomeFeatureRoute", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("devuelve null si no hay módulos activos", () => {
    vi.stubEnv("NEXT_PUBLIC_FEATURE_MANAGEMENT", "false");
    vi.stubEnv("NEXT_PUBLIC_FEATURE_EXPENSES", "false");
    expect(getSoloHomeFeatureRoute()).toBeNull();
  });

  it("devuelve /management si solo management está activo", () => {
    vi.stubEnv("NEXT_PUBLIC_FEATURE_MANAGEMENT", "true");
    vi.stubEnv("NEXT_PUBLIC_FEATURE_EXPENSES", "false");
    expect(getSoloHomeFeatureRoute()).toBe("/management");
  });

  it("devuelve /expenses si solo expenses está activo", () => {
    vi.stubEnv("NEXT_PUBLIC_FEATURE_MANAGEMENT", "false");
    vi.stubEnv("NEXT_PUBLIC_FEATURE_EXPENSES", "true");
    expect(getSoloHomeFeatureRoute()).toBe("/expenses");
  });

  it("devuelve null si hay más de un módulo activo", () => {
    vi.stubEnv("NEXT_PUBLIC_FEATURE_MANAGEMENT", "true");
    vi.stubEnv("NEXT_PUBLIC_FEATURE_EXPENSES", "true");
    expect(getSoloHomeFeatureRoute()).toBeNull();
  });
});
