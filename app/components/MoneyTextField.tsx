"use client";

import { TextField, type TextFieldProps } from "@mui/material";
import { useLayoutEffect, useRef } from "react";
import { amountToDigits, formatCopDigits, parseCopDigits } from "@/app/common/utils/currency";

type MoneyTextFieldProps = Omit<TextFieldProps, "defaultValue" | "onChange" | "type" | "value"> & {
  value: number | string;
  onAmountChange: (digits: string) => void;
};

function cursorAfterDigitCount(formatted: string, digitCount: number): number {
  if (!Number.isFinite(digitCount)) {
    return formatted.length;
  }

  if (digitCount <= 0) {
    return formatted.startsWith("$") ? 1 : 0;
  }

  let seen = 0;
  for (let index = 0; index < formatted.length; index += 1) {
    const character = formatted[index];
    if (character >= "0" && character <= "9") {
      seen += 1;
      if (seen === digitCount) {
        return index + 1;
      }
    }
  }

  return formatted.length;
}

export function MoneyTextField({
  value,
  onAmountChange,
  slotProps,
  onFocus,
  onMouseUp,
  ...rest
}: MoneyTextFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingDigitCursor = useRef<number | null>(null);
  const digits = amountToDigits(value);
  const display = formatCopDigits(digits);
  const htmlInputFromSlots =
    slotProps?.htmlInput && typeof slotProps.htmlInput === "object" ? slotProps.htmlInput : {};

  useLayoutEffect(() => {
    const element = inputRef.current;
    if (!element || pendingDigitCursor.current === null) {
      return;
    }

    const digitCount = pendingDigitCursor.current;
    pendingDigitCursor.current = null;
    const position = cursorAfterDigitCount(element.value, digitCount);
    element.setSelectionRange(position, position);
  }, [display]);

  return (
    <TextField
      {...rest}
      type="text"
      value={display}
      inputRef={inputRef}
      onFocus={(event) => {
        event.target.select();
        onFocus?.(event);
      }}
      onMouseUp={(event) => {
        event.preventDefault();
        onMouseUp?.(event);
      }}
      onChange={(event) => {
        const input = event.target;
        const cursor = input.selectionStart ?? input.value.length;
        const digitsBeforeCursor = input.value.slice(0, cursor).replace(/\D/g, "").length;
        const nextDigits = parseCopDigits(input.value);
        const nextDisplay = formatCopDigits(nextDigits);
        const nextCursorDigits = nextDigits === "" ? Number.POSITIVE_INFINITY : digitsBeforeCursor;

        if (nextDigits === digits) {
          if (input.value !== nextDisplay) {
            input.value = nextDisplay;
          }
          const position = cursorAfterDigitCount(nextDisplay, nextCursorDigits);
          input.setSelectionRange(position, position);
          return;
        }

        pendingDigitCursor.current = nextCursorDigits;
        onAmountChange(nextDigits);
      }}
      slotProps={{
        ...slotProps,
        htmlInput: {
          inputMode: "numeric",
          autoComplete: "off",
          spellCheck: false,
          ...htmlInputFromSlots,
        },
      }}
    />
  );
}
