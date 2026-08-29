"use client";

import { useState } from "react";
import { Calculator, Target } from "lucide-react";
import type { SerializedProduct } from "@/lib/serialize";
import { CalculatorClient } from "./CalculatorClient";
import { GoalCalculator } from "./GoalCalculator";

type Mode = "amount" | "goal";

export function CalculatorTabs({ products }: { products: SerializedProduct[] }) {
  const [mode, setMode] = useState<Mode>("amount");

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-xl bg-foreground/5 p-1 gap-1">
        <ModeTab active={mode === "amount"} onClick={() => setMode("amount")} icon={Calculator}>
          By amount
        </ModeTab>
        <ModeTab active={mode === "goal"} onClick={() => setMode("goal")} icon={Target}>
          By goal
        </ModeTab>
      </div>

      {mode === "amount" ? <CalculatorClient products={products} /> : <GoalCalculator products={products} />}
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Calculator;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`btn-press inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
        active ? "bg-surface shadow-sm text-foreground" : "text-muted hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}
