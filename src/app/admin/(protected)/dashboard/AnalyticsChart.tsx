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
  light: { series1: "#2a78d6", series2: "#b8790f", muted: "#5b6b62", grid: "#e6e8e2", surface: "#ffffff", ink: "#10201a" },
  dark: { series1: "#3987e5", series2: "#c98500", muted: "#9db3a9", grid: "#22322b", surface: "#101c18", ink: "#f3f6f4" },
};

export function AnalyticsChart({ data }: { data: DailyPoint[] }) {
  const isDark = useIsDark();
  const c = isDark ? palette.dark : palette.light;

  return (
    <div className="rounded-2xl card-surface p-4 shadow-sm">
      <h3 className="text-sm font-semibold mb-4">Daily visitors &amp; calculator uses (last 14 days)</h3>
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
