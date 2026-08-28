"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useIsDark } from "@/lib/useIsDark";

interface DailyPoint {
  day: string;
  visitors: number;
  calculations: number;
}

const palette = {
  light: { series1: "#2a78d6", series2: "#eb6834", muted: "#898781", grid: "#e1e0d9", surface: "#fcfcfb", ink: "#0b0b0b" },
  dark: { series1: "#3987e5", series2: "#d95926", muted: "#898781", grid: "#2c2c2a", surface: "#1a1a19", ink: "#ffffff" },
};

export function AnalyticsChart({ data }: { data: DailyPoint[] }) {
  const isDark = useIsDark();
  const c = isDark ? palette.dark : palette.light;

  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
      <h3 className="text-sm font-medium mb-4">Daily visitors &amp; calculator uses (last 14 days)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke={c.grid} vertical={false} />
          <XAxis dataKey="day" stroke={c.muted} tick={{ fill: c.muted, fontSize: 12 }} tickLine={false} axisLine={{ stroke: c.grid }} />
          <YAxis stroke={c.muted} tick={{ fill: c.muted, fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: c.surface, border: `1px solid ${c.grid}`, borderRadius: 8, fontSize: 12, color: c.ink }}
            labelStyle={{ color: c.ink }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: c.ink }} />
          <Line
            type="monotone"
            dataKey="visitors"
            name="Visitors"
            stroke={c.series1}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="calculations"
            name="Calculator uses"
            stroke={c.series2}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
