"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useIsDark } from "@/lib/useIsDark";
import { institutionTypeLabels, productTypeLabels } from "@/lib/labels";
import { chartPalette, seriesColor } from "@/lib/chart-palette";
import { InstitutionLogo } from "@/components/InstitutionLogo";
import type {
  CategoryStat,
  CompositionStat,
  GovtInstrumentRate,
  RateHeatmapData,
  TopRate,
  YieldCurvePoint,
} from "@/lib/insights";

function formatTenure(months: number): string {
  if (months % 12 === 0) return `${months / 12}y`;
  return `${months}m`;
}

/** Shortens the one genuinely long institution name for chart axis labels only. */
function chartLabel(institutionName: string): string {
  if (institutionName === "Bangladesh Bank / National Savings Directorate") return "BB / NSD";
  return institutionName;
}

function useChartColors() {
  const isDark = useIsDark();
  return isDark ? chartPalette.dark : chartPalette.light;
}

export function YieldCurveChart({ data }: { data: YieldCurvePoint[] }) {
  const c = useChartColors();
  if (data.length === 0) return <EmptyState label="No rate data available yet for this product type." />;

  const chartData = data.map((d) => ({ ...d, tenureLabel: formatTenure(d.tenureMonths) }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 4, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={c.grid} vertical={false} />
        <XAxis dataKey="tenureLabel" stroke={c.muted} tick={{ fill: c.muted, fontSize: 12 }} tickLine={false} axisLine={{ stroke: c.grid }} />
        <YAxis stroke={c.muted} tick={{ fill: c.muted, fontSize: 12 }} tickLine={false} axisLine={false} unit="%" />
        <Tooltip
          contentStyle={{ background: c.surface, border: `1px solid ${c.grid}`, borderRadius: 8, fontSize: 12, color: c.ink }}
          labelStyle={{ color: c.ink }}
          formatter={(value) => [`${Number(value).toFixed(2)}%`, undefined]}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: c.ink }}
          formatter={(value: string) => institutionTypeLabels[value as keyof typeof institutionTypeLabels]}
        />
        <Line type="monotone" dataKey="BANK" name="BANK" stroke={c.BANK} strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
        <Line type="monotone" dataKey="GOVERNMENT" name="GOVERNMENT" stroke={c.GOVERNMENT} strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
        <Line type="monotone" dataKey="INVESTMENT_ORG" name="INVESTMENT_ORG" stroke={c.INVESTMENT_ORG} strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CategoryBarChart({ data }: { data: CategoryStat[] }) {
  const c = useChartColors();
  const chartData = data
    .filter((d) => d.bestRate !== null)
    .map((d) => ({
      type: institutionTypeLabels[d.type],
      key: d.type,
      best: d.bestRate,
      avg: d.avgBestRate !== null ? Math.round(d.avgBestRate * 100) / 100 : null,
    }));

  if (chartData.length === 0) return <EmptyState label="No rate data available yet for this product type." />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 4, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={c.grid} vertical={false} />
        <XAxis dataKey="type" stroke={c.muted} tick={{ fill: c.muted, fontSize: 12 }} tickLine={false} axisLine={{ stroke: c.grid }} />
        <YAxis stroke={c.muted} tick={{ fill: c.muted, fontSize: 12 }} tickLine={false} axisLine={false} unit="%" />
        <Tooltip
          contentStyle={{ background: c.surface, border: `1px solid ${c.grid}`, borderRadius: 8, fontSize: 12, color: c.ink }}
          labelStyle={{ color: c.ink }}
          formatter={(value, name) => [`${Number(value).toFixed(2)}%`, name === "best" ? "Best rate" : "Average of best rates"]}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: c.ink }} formatter={(value: string) => (value === "best" ? "Best rate" : "Average of best rates")} />
        <Bar dataKey="best" radius={[4, 4, 0, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.key} fill={c[entry.key as "BANK" | "GOVERNMENT" | "INVESTMENT_ORG"]} />
          ))}
        </Bar>
        <Bar dataKey="avg" radius={[4, 4, 0, 0]} fillOpacity={0.4}>
          {chartData.map((entry) => (
            <Cell key={entry.key} fill={c[entry.key as "BANK" | "GOVERNMENT" | "INVESTMENT_ORG"]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Horizontal bar leaderboard of the very best rates across every institution/product. */
export function TopRatesLeaderboard({ data }: { data: TopRate[] }) {
  const c = useChartColors();
  const isDark = useIsDark();
  if (data.length === 0) return <EmptyState label="No rate data available yet." />;

  const chartData = data.map((d) => ({
    label: chartLabel(d.institutionName),
    sub: `${d.institutionName} — ${d.productName} · ${formatTenure(d.tenureMonths)}`,
    rate: d.interestRatePct,
    key: d.institutionType,
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(280, chartData.length * 34)}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 40, left: 4, bottom: 0 }}>
        <CartesianGrid stroke={c.grid} horizontal={false} />
        <XAxis type="number" stroke={c.muted} tick={{ fill: c.muted, fontSize: 12 }} tickLine={false} axisLine={{ stroke: c.grid }} unit="%" />
        <YAxis
          type="category"
          dataKey="label"
          width={150}
          stroke={c.muted}
          tick={{ fill: c.ink, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{ background: c.surface, border: `1px solid ${c.grid}`, borderRadius: 8, fontSize: 12, color: c.ink }}
          labelStyle={{ color: c.ink }}
          formatter={(value, _name, item) => [`${Number(value).toFixed(2)}%`, item.payload.sub]}
        />
        <Bar dataKey="rate" radius={[0, 4, 4, 0]} maxBarSize={20}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={seriesColor(i, isDark)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Donut chart of how many institutions of each type are tracked. */
export function CompositionDonut({ data }: { data: CompositionStat[] }) {
  const c = useChartColors();
  const chartData = data.filter((d) => d.count > 0).map((d) => ({ name: institutionTypeLabels[d.type], key: d.type, value: d.count }));
  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  if (chartData.length === 0) return <EmptyState label="No institutions tracked yet." />;

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3} strokeWidth={0}>
            {chartData.map((entry) => (
              <Cell key={entry.key} fill={c[entry.key as "BANK" | "GOVERNMENT" | "INVESTMENT_ORG"]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: c.surface, border: `1px solid ${c.grid}`, borderRadius: 8, fontSize: 12, color: c.ink }}
            labelStyle={{ color: c.ink }}
            formatter={(value, name) => [`${value} institution${Number(value) === 1 ? "" : "s"}`, name]}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: c.ink }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[240px] flex-col items-center justify-center -translate-y-3">
        <span className="font-display text-2xl font-bold" style={{ color: c.ink }}>
          {total}
        </span>
        <span className="text-xs" style={{ color: c.muted }}>
          tracked
        </span>
      </div>
    </div>
  );
}

/** Grouped bar chart of every government instrument, by tenure. */
export function GovtInstrumentsChart({ data }: { data: GovtInstrumentRate[] }) {
  const c = useChartColors();
  if (data.length === 0) return <EmptyState label="No government instrument data yet." />;

  const chartData = data
    .map((d) => ({
      label: `${productTypeLabels[d.productType] === "Sanchaypatro" ? d.productName : productTypeLabels[d.productType]} (${formatTenure(d.tenureMonths)})`,
      rate: d.interestRatePct,
      productType: d.productType,
    }))
    .sort((a, b) => b.rate - a.rate);

  return (
    <ResponsiveContainer width="100%" height={Math.max(240, chartData.length * 32)}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 40, left: 4, bottom: 0 }}>
        <CartesianGrid stroke={c.grid} horizontal={false} />
        <XAxis type="number" stroke={c.muted} tick={{ fill: c.muted, fontSize: 12 }} tickLine={false} axisLine={{ stroke: c.grid }} unit="%" />
        <YAxis type="category" dataKey="label" width={190} stroke={c.muted} tick={{ fill: c.ink, fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: c.surface, border: `1px solid ${c.grid}`, borderRadius: 8, fontSize: 12, color: c.ink }}
          labelStyle={{ color: c.ink }}
          formatter={(value) => [`${Number(value).toFixed(2)}%`, "Rate"]}
        />
        <Bar dataKey="rate" radius={[0, 4, 4, 0]} maxBarSize={18} fill={c.GOVERNMENT} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Sequential-intensity heatmap: institutions x tenure, colored by rate (single hue, magnitude only). */
export function RateHeatmap({ data }: { data: RateHeatmapData }) {
  const c = useChartColors();
  const { institutions, tenures, rates, institutionTypes } = data;

  if (institutions.length === 0 || tenures.length === 0) {
    return <EmptyState label="No FDR data available yet." />;
  }

  const allValues = institutions.flatMap((inst) => tenures.map((t) => rates[inst]?.[t]).filter((v): v is number => v !== undefined));
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-separate" style={{ borderSpacing: 4 }}>
        <thead>
          <tr>
            <th className="text-left font-medium pb-1 pr-2" style={{ color: c.muted }}>
              Institution
            </th>
            {tenures.map((t) => (
              <th key={t} className="font-medium pb-1 px-1 text-center whitespace-nowrap" style={{ color: c.muted }}>
                {formatTenure(t)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {institutions.map((inst) => (
            <tr key={inst}>
              <td className="pr-2 py-0.5 font-medium whitespace-nowrap" style={{ color: c.ink }}>
                <span className="flex items-center gap-1.5">
                  <InstitutionLogo name={inst} type={institutionTypes[inst]} size="sm" />
                  {inst}
                </span>
              </td>
              {tenures.map((t) => {
                const rate = rates[inst]?.[t];
                if (rate === undefined) {
                  return (
                    <td key={t} className="text-center py-2 px-1 rounded" style={{ background: c.grid, color: c.muted }}>
                      —
                    </td>
                  );
                }
                const intensity = 0.12 + 0.78 * ((rate - min) / range);
                return (
                  <td
                    key={t}
                    className="text-center py-2 px-1 rounded font-semibold tabular-nums"
                    style={{
                      background: `color-mix(in srgb, ${c.BANK} ${Math.round(intensity * 100)}%, ${c.surface})`,
                      color: intensity > 0.5 ? "#ffffff" : c.ink,
                    }}
                  >
                    {rate.toFixed(2)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="flex h-[220px] items-center justify-center text-sm text-muted">{label}</div>;
}
