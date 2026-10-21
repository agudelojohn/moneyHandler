import { afterEach, describe, expect, it, vi } from "vitest";
import { getSoloHomeFeatureRoute, isHomeFeatureEnabled } from "./featureFlags";

function stubAllHomeFlags(values: {
  management: string;
  expenses: string;
  household: string;
}) {
  vi.stubEnv("NEXT_PUBLIC_FEATURE_MANAGEMENT", values.management);
  vi.stubEnv("NEXT_PUBLIC_FEATURE_EXPENSES", values.expenses);
  vi.stubEnv("NEXT_PUBLIC_FEATURE_HOUSEHOLD", values.household);
}

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

  it("enciende household por defecto si la variable no está definida", () => {
    delete process.env.NEXT_PUBLIC_FEATURE_HOUSEHOLD;
    expect(isHomeFeatureEnabled("household")).toBe(true);
  });

  it("enciende la flag cuando vale true", () => {
    vi.stubEnv("NEXT_PUBLIC_FEATURE_MANAGEMENT", "true");
    expect(isHomeFeatureEnabled("management")).toBe(true);
  });

  it("apaga la flag cuando vale false", () => {
    vi.stubEnv("NEXT_PUBLIC_FEATURE_HOUSEHOLD", "false");
    expect(isHomeFeatureEnabled("household")).toBe(false);
  });
});

describe("getSoloHomeFeatureRoute", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("devuelve null si no hay módulos activos", () => {
    stubAllHomeFlags({ management: "false", expenses: "false", household: "false" });
    expect(getSoloHomeFeatureRoute()).toBeNull();
  });

  it("devuelve /management si solo management está activo", () => {
    stubAllHomeFlags({ management: "true", expenses: "false", household: "false" });
    expect(getSoloHomeFeatureRoute()).toBe("/management");
  });

  it("devuelve /expenses si solo expenses está activo", () => {
    stubAllHomeFlags({ management: "false", expenses: "true", household: "false" });
    expect(getSoloHomeFeatureRoute()).toBe("/expenses");
  });

  it("devuelve /household si solo household está activo", () => {
    stubAllHomeFlags({ management: "false", expenses: "false", household: "true" });
    expect(getSoloHomeFeatureRoute()).toBe("/household");
  });

  it("devuelve null si hay más de un módulo activo", () => {
    stubAllHomeFlags({ management: "true", expenses: "true", household: "false" });
    expect(getSoloHomeFeatureRoute()).toBeNull();
  });
});
