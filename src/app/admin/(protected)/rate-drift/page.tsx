import { getPendingDriftFlags } from "@/lib/drift-queries";
import { productTypeLabels } from "@/lib/labels";
import { approveDriftFlag, rejectDriftFlag } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export default async function RateDriftPage() {
  const flags = await getPendingDriftFlags();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Rate Drift Review</h1>
        <p className="text-muted mt-1 text-sm">
          Differences the scraper found between a live rate page and what&apos;s currently stored.
          Nothing here is applied to the site until you approve it — see{" "}
          <code>scripts/scrapers/runner.ts</code>.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl card-surface shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-foreground/[0.03] text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Institution / product</th>
              <th className="px-4 py-3 font-semibold">Tenure</th>
              <th className="px-4 py-3 font-semibold text-right">Current</th>
              <th className="px-4 py-3 font-semibold text-right">Proposed</th>
              <th className="px-4 py-3 font-semibold">Source</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {flags.map((flag) => (
              <tr key={flag.id} className="border-t border-border row-interactive">
                <td className="px-4 py-3">
                  <div className="font-medium">{flag.product.institution.name}</div>
                  <div className="text-xs text-muted">
                    {flag.product.name} · {productTypeLabels[flag.product.productType]}
                  </div>
                </td>
                <td className="px-4 py-3">{flag.tenureMonths} mo</td>
                <td className="px-4 py-3 text-right tabular-nums text-muted">
                  {flag.currentRatePct !== null ? `${Number(flag.currentRatePct).toFixed(2)}%` : "new"}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold">
                  {Number(flag.proposedRatePct).toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-xs">
                  <a
                    href={flag.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-dotted hover:text-foreground"
                  >
                    source
                  </a>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <form
                      action={async () => {
                        "use server";
                        await approveDriftFlag(flag.id);
                      }}
                    >
                      <button className="text-emerald-600 dark:text-emerald-400 hover:underline text-xs font-semibold">
                        Approve
                      </button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await rejectDriftFlag(flag.id);
                      }}
                    >
                      <button className="text-red-600 hover:underline text-xs font-semibold">
                        Reject
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {flags.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted">
                  No pending rate changes. Nothing to review right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
