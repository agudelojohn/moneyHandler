/** Flags públicas de home. Se leen en runtime para poder stubbearlas en tests. */

export type HomeFeature = "management" | "expenses";

const HOME_FEATURES: HomeFeature[] = ["management", "expenses"];

const HOME_FEATURE_ROUTES: Record<HomeFeature, string> = {
  management: "/management",
  expenses: "/expenses",
};

const DEFAULT_ENABLED = true;

function parsePublicFlag(value: string | undefined, defaultValue = DEFAULT_ENABLED): boolean {
  if (value === undefined || value === "") {
    return defaultValue;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return defaultValue;
}

export function isHomeFeatureEnabled(feature: HomeFeature): boolean {
  // Next.js solo inyecta NEXT_PUBLIC_* con acceso estático (no process.env[nombre]).
  switch (feature) {
    case "management":
      return parsePublicFlag(process.env.NEXT_PUBLIC_FEATURE_MANAGEMENT);
    case "expenses":
      return parsePublicFlag(process.env.NEXT_PUBLIC_FEATURE_EXPENSES);
  }
}

/** Ruta del único módulo activo, o null si hay 0 o más de uno. */
export function getSoloHomeFeatureRoute(): string | null {
  const enabled = HOME_FEATURES.filter((feature) => isHomeFeatureEnabled(feature));
  if (enabled.length !== 1) {
    return null;
  }
  return HOME_FEATURE_ROUTES[enabled[0]];
}
