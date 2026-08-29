import { getDashboardStats, getTrendingProducts } from "@/lib/analytics-queries";
import { AnalyticsChart } from "./AnalyticsChart";

export const dynamic = "force-dynamic";

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl card-surface p-4 shadow-sm">
      <p className="text-xs text-muted">{label}</p>
      <p className="font-display text-2xl font-bold tabular-nums mt-1">{value.toLocaleString()}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [stats, trending] = await Promise.all([getDashboardStats(), getTrendingProducts()]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Institutions" value={stats.institutionCount} />
        <StatTile label="Products" value={stats.productCount} />
        <StatTile label="Rate tiers" value={stats.rateTierCount} />
        <StatTile label="Visitors (14d)" value={stats.distinctSessions} />
        <StatTile label="Page views (14d)" value={stats.totalPageViews} />
        <StatTile label="Calculator uses (14d)" value={stats.totalCalculatorUses} />
      </div>

      <AnalyticsChart data={stats.dailySeries} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl card-surface p-4 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Most-viewed pages (14d)</h3>
          {stats.topPaths.length === 0 ? (
            <p className="text-sm text-muted">No page views recorded yet.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {stats.topPaths.map((p) => (
                <li key={p.path} className="flex items-center justify-between">
                  <span className="font-mono text-xs">{p.path}</span>
                  <span className="tabular-nums text-muted">{p.views}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl card-surface p-4 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Trending products (7d)</h3>
          {trending.length === 0 ? (
            <p className="text-sm text-muted">Not enough activity yet.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {trending.map((p) => (
                <li key={p.productId} className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate">
                    {p.institutionName} — {p.productName}
                  </span>
                  <span className="shrink-0 tabular-nums text-muted">
                    {p.calcCount + p.compareCount}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
