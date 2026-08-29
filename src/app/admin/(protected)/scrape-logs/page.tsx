import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ScrapeLogsPage() {
  const logs = await prisma.scrapeLog.findMany({
    orderBy: { runAt: "desc" },
    take: 100,
    include: { institution: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Scrape Logs</h1>
        <p className="text-muted mt-1 text-sm">
          Results from the scheduled scraper (runs via GitHub Actions). Empty until scrapers are
          configured and have run at least once — see <code>scripts/scrapers/</code>.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl card-surface shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-foreground/[0.03] text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Ran at</th>
              <th className="px-4 py-3 font-semibold">Institution</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Message</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-border row-interactive">
                <td className="px-4 py-3 tabular-nums">{log.runAt.toISOString()}</td>
                <td className="px-4 py-3">{log.institution?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      log.status === "SUCCESS"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : log.status === "PARTIAL"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-red-600 dark:text-red-400"
                    }
                  >
                    {log.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{log.message ?? "—"}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted">
                  No scrape runs recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
