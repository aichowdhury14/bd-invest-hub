"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useIsDark } from "@/lib/useIsDark";
import { chartPalette } from "@/lib/chart-palette";
import type { InstitutionType } from "@prisma/client";

export interface ComparisonBar {
  id: string;
  label: string;
  sub: string;
  maturityAmount: number | null;
  institutionType: InstitutionType;
}

const bdt = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

export function ComparisonChart({ bars }: { bars: ComparisonBar[] }) {
  const isDark = useIsDark();
  const c = isDark ? chartPalette.dark : chartPalette.light;
  const available = bars.filter((b) => b.maturityAmount !== null);

  if (available.length === 0) {
    return (
      <div className="flex h-[160px] items-center justify-center text-sm text-muted text-center px-4">
        None of the selected products are offered at this amount/tenure — try adjusting the slider
        above.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, available.length * 56)}>
      <BarChart data={available} layout="vertical" margin={{ top: 4, right: 60, left: 4, bottom: 0 }}>
        <CartesianGrid stroke={c.grid} horizontal={false} />
        <XAxis
          type="number"
          stroke={c.muted}
          tick={{ fill: c.muted, fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: c.grid }}
          tickFormatter={(v: number) => (v >= 100000 ? `${(v / 100000).toFixed(0)}L` : `${v}`)}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={110}
          stroke={c.muted}
          tick={{ fill: c.ink, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{ background: c.surface, border: `1px solid ${c.grid}`, borderRadius: 8, fontSize: 12, color: c.ink }}
          labelStyle={{ color: c.ink }}
          formatter={(value, _name, item) => [bdt.format(Number(value)), item.payload.sub]}
        />
        <Bar dataKey="maturityAmount" radius={[0, 4, 4, 0]} maxBarSize={28}>
          {available.map((entry) => (
            <Cell key={entry.id} fill={c[entry.institutionType]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
