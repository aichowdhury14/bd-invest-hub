import { unstable_cache } from "next/cache";
import {
  getGovernmentInstrumentRates,
  getInsightsData,
  getInstitutionComposition,
  getTrendStatus,
  type TrendStatus,
} from "@/lib/insights";

/** Invalidated by every admin mutation that can change what the Insights page shows. */
export const INSIGHTS_CACHE_TAG = "insights";

/**
 * Cached versions of the Insights page's loaders.
 *
 * The page reads `searchParams.mode` for the Conventional/Islamic toggle, which
 * makes it a dynamic route — so its `export const revalidate` never applies and,
 * without this, every request re-ran ~7 queries (two of them scans of the
 * largest table, RateHistory) against the 3-connection Supabase pool. Caching
 * at the data layer instead keeps the page dynamic while serving it from cache.
 * Arguments are part of the cache key, so each banking mode is cached separately.
 */
const options = { revalidate: 300, tags: [INSIGHTS_CACHE_TAG] };

export const getCachedInsightsData = unstable_cache(getInsightsData, ["insights-data"], options);

export const getCachedInstitutionComposition = unstable_cache(
  getInstitutionComposition,
  ["insights-composition"],
  options
);

export const getCachedGovernmentInstrumentRates = unstable_cache(
  getGovernmentInstrumentRates,
  ["insights-govt-rates"],
  options
);

const cachedTrendStatus = unstable_cache(getTrendStatus, ["insights-trend-status"], options);

/** `unstable_cache` round-trips through JSON, which turns `firstSnapshotAt` into an ISO string. */
export async function getCachedTrendStatus(): Promise<TrendStatus> {
  const status = await cachedTrendStatus();
  return {
    ...status,
    firstSnapshotAt: status.firstSnapshotAt ? new Date(status.firstSnapshotAt) : null,
  };
}
