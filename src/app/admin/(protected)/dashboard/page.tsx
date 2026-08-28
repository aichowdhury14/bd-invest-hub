import { getDashboardStats } from "@/lib/analytics-queries";
import { AnalyticsChart } from "./AnalyticsChart";

export const dynamic = "force-dynamic";

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
      <p className="text-xs text-black/50 dark:text-white/50">{label}</p>
      <p className="text-2xl font-semibold tabular-nums mt-1">{value.toLocaleString()}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Institutions" value={stats.institutionCount} />
        <StatTile label="Products" value={stats.productCount} />
        <StatTile label="Rate tiers" value={stats.rateTierCount} />
        <StatTile label="Visitors (14d)" value={stats.distinctSessions} />
        <StatTile label="Page views (14d)" value={stats.totalPageViews} />
        <StatTile label="Calculator uses (14d)" value={stats.totalCalculatorUses} />
      </div>

      <AnalyticsChart data={stats.dailySeries} />

      <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
        <h3 className="text-sm font-medium mb-3">Most-viewed pages (14d)</h3>
        {stats.topPaths.length === 0 ? (
          <p className="text-sm text-black/50 dark:text-white/50">No page views recorded yet.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {stats.topPaths.map((p) => (
              <li key={p.path} className="flex items-center justify-between">
                <span className="font-mono text-xs">{p.path}</span>
                <span className="tabular-nums text-black/60 dark:text-white/60">{p.views}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
