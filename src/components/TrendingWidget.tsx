import { TrendingUp } from "lucide-react";
import { InstitutionLogo } from "@/components/InstitutionLogo";
import type { TrendingProduct } from "@/lib/analytics-queries";

/** Real usage only — the caller should skip rendering this when the list is empty. */
export function TrendingWidget({ products }: { products: TrendingProduct[] }) {
  if (products.length === 0) return null;

  return (
    <div className="rounded-2xl card-surface p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-accent" />
        <h2 className="font-display font-bold">Trending this week</h2>
        <span className="text-xs text-muted">— based on real visitor activity, not a ranking</span>
      </div>
      <ul className="space-y-1">
        {products.map((p, i) => {
          const activity = p.calcCount + p.compareCount;
          return (
            <li
              key={p.productId}
              className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-foreground/5 transition-colors"
            >
              <span className="w-5 shrink-0 text-center text-sm font-display font-bold text-muted tabular-nums">
                {i + 1}
              </span>
              <InstitutionLogo name={p.institutionName} type={p.institutionType} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{p.institutionName}</p>
                <p className="truncate text-xs text-muted">{p.productName}</p>
              </div>
              <span className="shrink-0 text-xs text-muted tabular-nums">
                {activity} {activity === 1 ? "check" : "checks"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
