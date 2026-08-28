"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useIsDark } from "@/lib/useIsDark";
import { institutionTypeLabels } from "@/lib/labels";
import type { YieldCurvePoint, CategoryStat } from "@/lib/insights";

const palette = {
  light: {
    BANK: "#2563eb",
    GOVERNMENT: "#d97706",
    INVESTMENT_ORG: "#7c3aed",
    muted: "#5b6b62",
    grid: "#e6e8e2",
    surface: "#ffffff",
    ink: "#10201a",
  },
  dark: {
    BANK: "#3b82f6",
    GOVERNMENT: "#c98500",
    INVESTMENT_ORG: "#8b5cf6",
    muted: "#9db3a9",
    grid: "#22322b",
    surface: "#101c18",
    ink: "#f3f6f4",
  },
};

function formatTenure(months: number): string {
  if (months % 12 === 0) return `${months / 12}y`;
  return `${months}m`;
}

export function YieldCurveChart({ data }: { data: YieldCurvePoint[] }) {
  const isDark = useIsDark();
  const c = isDark ? palette.dark : palette.light;

  if (data.length === 0) {
    return <EmptyState label="No rate data available yet for this product type." />;
  }

  const chartData = data.map((d) => ({ ...d, tenureLabel: formatTenure(d.tenureMonths) }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 4, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={c.grid} vertical={false} />
        <XAxis
          dataKey="tenureLabel"
          stroke={c.muted}
          tick={{ fill: c.muted, fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: c.grid }}
        />
        <YAxis
          stroke={c.muted}
          tick={{ fill: c.muted, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          unit="%"
        />
        <Tooltip
          contentStyle={{
            background: c.surface,
            border: `1px solid ${c.grid}`,
            borderRadius: 8,
            fontSize: 12,
            color: c.ink,
          }}
          labelStyle={{ color: c.ink }}
          formatter={(value) => [`${Number(value).toFixed(2)}%`, undefined]}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: c.ink }}
          formatter={(value: string) => institutionTypeLabels[value as keyof typeof institutionTypeLabels]}
        />
        <Line type="monotone" dataKey="BANK" name="BANK" stroke={c.BANK} strokeWidth={2} dot={{ r: 3 }} connectNulls />
        <Line
          type="monotone"
          dataKey="GOVERNMENT"
          name="GOVERNMENT"
          stroke={c.GOVERNMENT}
          strokeWidth={2}
          dot={{ r: 3 }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="INVESTMENT_ORG"
          name="INVESTMENT_ORG"
          stroke={c.INVESTMENT_ORG}
          strokeWidth={2}
          dot={{ r: 3 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CategoryBarChart({ data }: { data: CategoryStat[] }) {
  const isDark = useIsDark();
  const c = isDark ? palette.dark : palette.light;

  const chartData = data
    .filter((d) => d.bestRate !== null)
    .map((d) => ({
      type: institutionTypeLabels[d.type],
      key: d.type,
      best: d.bestRate,
      avg: d.avgBestRate !== null ? Math.round(d.avgBestRate * 100) / 100 : null,
    }));

  if (chartData.length === 0) {
    return <EmptyState label="No rate data available yet for this product type." />;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 4, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={c.grid} vertical={false} />
        <XAxis dataKey="type" stroke={c.muted} tick={{ fill: c.muted, fontSize: 12 }} tickLine={false} axisLine={{ stroke: c.grid }} />
        <YAxis stroke={c.muted} tick={{ fill: c.muted, fontSize: 12 }} tickLine={false} axisLine={false} unit="%" />
        <Tooltip
          contentStyle={{
            background: c.surface,
            border: `1px solid ${c.grid}`,
            borderRadius: 8,
            fontSize: 12,
            color: c.ink,
          }}
          labelStyle={{ color: c.ink }}
          formatter={(value, name) => [`${Number(value).toFixed(2)}%`, name === "best" ? "Best rate" : "Average of best rates"]}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: c.ink }}
          formatter={(value: string) => (value === "best" ? "Best rate" : "Average of best rates")}
        />
        <Bar dataKey="best" radius={[4, 4, 0, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.key} fill={c[entry.key as "BANK" | "GOVERNMENT" | "INVESTMENT_ORG"]} />
          ))}
        </Bar>
        <Bar dataKey="avg" radius={[4, 4, 0, 0]} fillOpacity={0.45}>
          {chartData.map((entry) => (
            <Cell key={entry.key} fill={c[entry.key as "BANK" | "GOVERNMENT" | "INVESTMENT_ORG"]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center text-sm text-muted">
      {label}
    </div>
  );
}
