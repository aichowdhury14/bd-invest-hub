import { BrainCircuit, Crown, LayoutGrid, Lightbulb, TrendingUp, Trophy } from "lucide-react";
import { Container } from "@/components/Container";
import {
  buildMarketInsights,
  getCategoryStats,
  getFDRHeatmap,
  getGovernmentInstrumentRates,
  getInflationBeatStat,
  getInstitutionComposition,
  getTopRates,
  getTrendStatus,
  getYieldCurve,
} from "@/lib/insights";
import { institutionTypeLabels } from "@/lib/labels";
import { institutionTypeStyle } from "@/lib/institution-style";
import {
  CategoryBarChart,
  CompositionDonut,
  GovtInstrumentsChart,
  RateHeatmap,
  TopRatesLeaderboard,
  YieldCurveChart,
} from "./charts";

export const revalidate = 300;

export default async function InsightsPage() {
  const [
    fdrCurve,
    dpsCurve,
    fdrStats,
    dpsStats,
    topRates,
    trendStatus,
    composition,
    govtRates,
    heatmap,
    inflationStat,
  ] = await Promise.all([
    getYieldCurve("FDR"),
    getYieldCurve("DPS"),
    getCategoryStats("FDR"),
    getCategoryStats("DPS"),
    getTopRates(10),
    getTrendStatus(),
    getInstitutionComposition(),
    getGovernmentInstrumentRates(),
    getFDRHeatmap(),
    getInflationBeatStat(),
  ]);
  // Derived from data already fetched above — no extra DB round-trips.
  const topRate = topRates[0] ?? null;
  const marketInsights = buildMarketInsights({ fdrCurve, fdrStats, dpsStats, inflationStat });

  return (
    <div>
      <section className="brand-gradient text-white">
        <Container className="py-10 sm:py-14 space-y-3">
          <span className="inline-grid h-10 w-10 place-items-center rounded-xl bg-white/15">
            <BrainCircuit className="h-5 w-5" />
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Market Insights
          </h1>
          <p className="text-white/85 max-w-2xl">
            Live statistics and smart comparisons computed from every rate currently tracked —
            not predictions, just a clearer view of what&apos;s actually on offer right now.
          </p>
        </Container>
      </section>

      <Container className="py-10 sm:py-12 space-y-12">
        {topRate && (
          <section className="rounded-2xl card-surface p-6 shadow-sm flex flex-wrap items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent/15 text-accent shrink-0">
              <Crown className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm text-muted">Highest rate tracked right now</p>
              <p className="font-display text-2xl font-bold">
                {topRate.interestRatePct.toFixed(2)}%{" "}
                <span className="text-base font-normal text-muted">
                  — {topRate.institutionName} · {topRate.productName} ·{" "}
                  {topRate.tenureMonths % 12 === 0
                    ? `${topRate.tenureMonths / 12}yr`
                    : `${topRate.tenureMonths}mo`}
                </span>
              </p>
            </div>
          </section>
        )}

        {marketInsights.length > 0 && (
          <section className="space-y-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-accent" />
              <h2 className="font-display text-xl font-bold tracking-tight">
                Smart Market Insights
              </h2>
            </div>
            <p className="text-sm text-muted -mt-3">
              Auto-generated from today&apos;s tracked rates — a rule-based reading of the numbers,
              not a forecast of where rates are headed.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {marketInsights.map((insight, i) => (
                <div key={i} className="rounded-2xl card-surface p-5 shadow-sm space-y-1.5">
                  <p className="font-semibold leading-snug">{insight.title}</p>
                  <p className="text-sm text-muted leading-relaxed">{insight.detail}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            <h2 className="font-display text-xl font-bold tracking-tight">
              Top 10 rates right now
            </h2>
          </div>
          <p className="text-sm text-muted -mt-3">
            The single best-paying options across every institution, product, and tenure we track.
          </p>
          <div className="rounded-2xl card-surface p-4 sm:p-6 shadow-sm">
            <TopRatesLeaderboard data={topRates} />
          </div>
        </section>

        <section className="space-y-5">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">
              Fixed Deposit (FDR) yield curve
            </h2>
            <p className="text-sm text-muted mt-1">
              Best FDR rate offered at each tenure, by institution type. A rising curve means
              longer commitments pay more — compare how steeply each category rewards patience.
            </p>
          </div>
          <div className="rounded-2xl card-surface p-4 sm:p-6 shadow-sm">
            <YieldCurveChart data={fdrCurve} />
          </div>
        </section>

        <section className="space-y-5">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">DPS yield curve</h2>
            <p className="text-sm text-muted mt-1">
              Same idea for recurring monthly-deposit schemes.
            </p>
          </div>
          <div className="rounded-2xl card-surface p-4 sm:p-6 shadow-sm">
            <YieldCurveChart data={dpsCurve} />
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section className="space-y-5">
            <h2 className="font-display text-xl font-bold tracking-tight">FDR by category</h2>
            <div className="rounded-2xl card-surface p-4 sm:p-6 shadow-sm">
              <CategoryBarChart data={fdrStats} />
            </div>
          </section>
          <section className="space-y-5">
            <h2 className="font-display text-xl font-bold tracking-tight">DPS by category</h2>
            <div className="rounded-2xl card-surface p-4 sm:p-6 shadow-sm">
              <CategoryBarChart data={dpsStats} />
            </div>
          </section>
        </div>

        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-muted" />
            <h2 className="font-display text-xl font-bold tracking-tight">
              FDR rate heatmap
            </h2>
          </div>
          <p className="text-sm text-muted -mt-3">
            Top institutions by best rate, across the most commonly offered tenures. Darker means
            a higher rate.
          </p>
          <div className="rounded-2xl card-surface p-4 sm:p-6 shadow-sm">
            <RateHeatmap data={heatmap} />
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="font-display text-xl font-bold tracking-tight">
            Government instruments compared
          </h2>
          <p className="text-sm text-muted -mt-3">
            Sanchayapatro variants, Treasury Bonds, and Treasury Bills, side by side.
          </p>
          <div className="rounded-2xl card-surface p-4 sm:p-6 shadow-sm">
            <GovtInstrumentsChart data={govtRates} />
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_2fr]">
          <section className="space-y-5">
            <h2 className="font-display text-xl font-bold tracking-tight">Who we track</h2>
            <div className="rounded-2xl card-surface p-4 sm:p-6 shadow-sm">
              <CompositionDonut data={composition} />
            </div>
          </section>
          <section className="space-y-5">
            <h2 className="font-display text-xl font-bold tracking-tight">By the numbers</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <CategoryCard type="BANK" stat={fdrStats.find((s) => s.type === "BANK")} />
              <CategoryCard type="GOVERNMENT" stat={fdrStats.find((s) => s.type === "GOVERNMENT")} />
              <CategoryCard
                type="INVESTMENT_ORG"
                stat={fdrStats.find((s) => s.type === "INVESTMENT_ORG")}
              />
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-dashed border-border p-6 sm:p-8 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted" />
            <h2 className="font-display text-lg font-bold">Rate trends over time</h2>
          </div>
          {trendStatus.hasEnoughData ? (
            <p className="text-sm text-muted">
              Tracking since {trendStatus.firstSnapshotAt?.toLocaleDateString()} —{" "}
              {trendStatus.snapshotCount.toLocaleString()} snapshots across {trendStatus.daysTracked}{" "}
              days.
            </p>
          ) : (
            <p className="text-sm text-muted max-w-2xl">
              We started tracking rate history on{" "}
              {trendStatus.firstSnapshotAt
                ? trendStatus.firstSnapshotAt.toLocaleDateString()
                : "the day this feature launched"}
              . Trend charts and rate-movement forecasts need real historical data to be honest —
              we won&apos;t show a prediction built on guessed history. Check back as more days of
              tracking accumulate ({trendStatus.daysTracked} day{trendStatus.daysTracked === 1 ? "" : "s"}{" "}
              tracked so far).
            </p>
          )}
        </section>
      </Container>
    </div>
  );
}

function CategoryCard({
  type,
  stat,
}: {
  type: "BANK" | "GOVERNMENT" | "INVESTMENT_ORG";
  stat?: { bestRate: number | null; avgBestRate: number | null; productCount: number };
}) {
  const style = institutionTypeStyle[type];
  const Icon = style.icon;
  return (
    <div className="rounded-2xl card-surface p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-2.5">
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${style.iconWrap}`}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
        <h3 className="font-semibold">{institutionTypeLabels[type]}</h3>
      </div>
      {stat && stat.bestRate !== null ? (
        <div className="space-y-1">
          <p className="font-display text-2xl font-bold tabular-nums">{stat.bestRate.toFixed(2)}%</p>
          <p className="text-xs text-muted">Best FDR rate found</p>
          <p className="text-xs text-muted">
            Avg of best rates: {stat.avgBestRate?.toFixed(2)}% across {stat.productCount} product
            {stat.productCount === 1 ? "" : "s"}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted">No FDR data yet.</p>
      )}
    </div>
  );
}
