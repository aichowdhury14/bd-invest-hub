"use client";

import { useState } from "react";

/**
 * A numeric BDT amount input, backed by a string so the field can be genuinely
 * empty while editing. Fixes the classic React controlled-number-input bug:
 * with `type="number" value={amount}` and `setAmount(Number(e.target.value))`,
 * clearing the field forces state to 0, which redisplays as the text "0" —
 * then new digits get typed AFTER that leftover "0" (cursor lands at the end),
 * so typing "5000" produces "05000". Backing the field with a string that can
 * be "" (rather than coercing straight to a number) avoids the leftover digit
 * entirely.
 */
export function useAmountInput(initial: number) {
  const [raw, setRaw] = useState(String(initial));
  const amount = raw === "" ? 0 : Number(raw) || 0;

  function onChange(value: string) {
    if (value === "") {
      setRaw("");
      return;
    }
    if (!/^\d+$/.test(value)) return; // ignore non-digit input (paste, letters, etc.)
    setRaw(value.replace(/^0+(?=\d)/, "")); // never let a leading zero linger
  }

  return { amount, raw, onChange } as const;
}
