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
        <h1 className="text-2xl font-bold tracking-tight">Scrape Logs</h1>
        <p className="text-black/70 dark:text-white/70 mt-1 text-sm">
          Results from the scheduled scraper (runs via GitHub Actions). Empty until scrapers are
          configured and have run at least once — see <code>scripts/scrapers/</code>.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-black/5 dark:bg-white/5 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Ran at</th>
              <th className="px-4 py-3 font-medium">Institution</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Message</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-black/10 dark:border-white/10">
                <td className="px-4 py-3 tabular-nums">{log.runAt.toISOString()}</td>
                <td className="px-4 py-3">{log.institution?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      log.status === "SUCCESS"
                        ? "text-emerald-700 dark:text-emerald-400"
                        : log.status === "PARTIAL"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-red-600 dark:text-red-400"
                    }
                  >
                    {log.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-black/60 dark:text-white/60">{log.message ?? "—"}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-black/50 dark:text-white/50">
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
