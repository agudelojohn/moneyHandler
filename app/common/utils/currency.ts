/** Pesos colombianos sin decimales: 500000 → "$500.000". */
export function formatCopDigits(digits: string): string {
  if (!/^\d+$/.test(digits)) {
    return "";
  }

  const normalized = digits.replace(/^0+(?=\d)/, "");
  const withSeparators = normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `$${withSeparators}`;
}

/** Deja solo dígitos y quita ceros a la izquierda. Vacío si no hay monto. */
export function parseCopDigits(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits === "") {
    return "";
  }

  return digits.replace(/^0+(?=\d)/, "");
}

export function amountToDigits(value: number | string): string {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return "";
    }

    return String(Math.trunc(Math.abs(value)));
  }

  return parseCopDigits(value);
}
