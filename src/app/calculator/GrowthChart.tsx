"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useIsDark } from "@/lib/useIsDark";
import type { GrowthPoint } from "@/lib/calculations";

const palette = {
  light: { contributed: "#5b6b62", interest: "#0a5a45", muted: "#5b6b62", grid: "#e6e8e2", surface: "#ffffff", ink: "#10201a" },
  dark: { contributed: "#9db3a9", interest: "#1fae82", muted: "#9db3a9", grid: "#22322b", surface: "#101c18", ink: "#f3f6f4" },
};

const bdt = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

function formatTenure(months: number): string {
  if (months % 12 === 0) return `${months / 12}y`;
  return `${months}m`;
}

export function GrowthChart({ series }: { series: GrowthPoint[] }) {
  const isDark = useIsDark();
  const c = isDark ? palette.dark : palette.light;

  const data = series.map((p) => ({
    label: formatTenure(p.month),
    contributed: p.contributed,
    interest: Math.max(0, p.balance - p.contributed),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 4, right: 12, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="contributedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.contributed} stopOpacity={0.35} />
            <stop offset="100%" stopColor={c.contributed} stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="interestFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.interest} stopOpacity={0.5} />
            <stop offset="100%" stopColor={c.interest} stopOpacity={0.08} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={c.grid} vertical={false} />
        <XAxis dataKey="label" stroke={c.muted} tick={{ fill: c.muted, fontSize: 12 }} tickLine={false} axisLine={{ stroke: c.grid }} />
        <YAxis
          stroke={c.muted}
          tick={{ fill: c.muted, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => (v >= 100000 ? `${(v / 100000).toFixed(0)}L` : `${v}`)}
        />
        <Tooltip
          contentStyle={{ background: c.surface, border: `1px solid ${c.grid}`, borderRadius: 8, fontSize: 12, color: c.ink }}
          labelStyle={{ color: c.ink }}
          formatter={(value, name) => [
            bdt.format(Number(value)),
            name === "contributed" ? "Deposited" : "Interest earned",
          ]}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: c.ink }}
          formatter={(value: string) => (value === "contributed" ? "Deposited" : "Interest earned")}
        />
        <Area
          type="monotone"
          dataKey="contributed"
          stackId="1"
          stroke={c.contributed}
          fill="url(#contributedFill)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="interest"
          stackId="1"
          stroke={c.interest}
          fill="url(#interestFill)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
