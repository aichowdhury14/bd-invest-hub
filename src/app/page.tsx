import Link from "next/link";
import { ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import { getActiveInstitutionsWithProducts, bestRateForProduct } from "@/lib/products";
import { institutionTypeLabels, productTypeLabels } from "@/lib/labels";
import { institutionTypeStyle } from "@/lib/institution-style";
import { Container } from "@/components/Container";
import { InstitutionLogo } from "@/components/InstitutionLogo";
import { TrendingWidget } from "@/components/TrendingWidget";
import { getTrendingProducts } from "@/lib/analytics-queries";
import type { InstitutionType } from "@prisma/client";

export const revalidate = 300;

const SECTION_ORDER: InstitutionType[] = ["BANK", "DIGITAL_BANK", "GOVERNMENT", "INVESTMENT_ORG"];

export default async function HomePage() {
  const [institutions, trending] = await Promise.all([
    getActiveInstitutionsWithProducts(),
    getTrendingProducts(),
  ]);
  const bySection = new Map<InstitutionType, typeof institutions>();
  for (const type of SECTION_ORDER) bySection.set(type, []);
  for (const inst of institutions) {
    bySection.get(inst.type)?.push(inst);
  }

  const hasAnyData = institutions.length > 0;
  const productCount = institutions.reduce((n, inst) => n + inst.products.length, 0);
  const rateCount = institutions.reduce(
    (n, inst) => n + inst.products.reduce((m, p) => m + p.rateTiers.length, 0),
    0
  );
  let topRate: { pct: number; institution: string; product: string } | null = null;
  for (const inst of institutions) {
    for (const product of inst.products) {
      const best = bestRateForProduct(product.rateTiers);
      if (best !== null && (!topRate || best > topRate.pct)) {
        topRate = { pct: best, institution: inst.name, product: productTypeLabels[product.productType] };
      }
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden brand-gradient text-white">
        <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-black/10 blur-3xl" aria-hidden />
        <Container className="relative py-16 sm:py-24 space-y-8">
          <div className="max-w-2xl space-y-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Built for Bangladesh
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
              Find your best return, before you invest a single taka.
            </h1>
            <p className="text-white/85 text-base sm:text-lg leading-relaxed">
              Compare FDR, DPS, Sanchayapatra, Treasury instruments, and investment-organization
              rates from across Bangladesh in one place — then calculate exactly what your money
              grows into.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/calculator"
                className="group/cta btn-press inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-800 shadow-lg shadow-black/10 hover:shadow-xl hover:bg-white/95 transition-colors"
              >
                Open the calculator
                <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-1" />
              </Link>
              <Link
                href="/compare"
                className="btn-press inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold hover:bg-white/10 hover:border-white/50 transition-colors"
              >
                Compare institutions
              </Link>
            </div>
          </div>

          {hasAnyData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 max-w-3xl">
              <StatPill value={institutions.length} label="Institutions" />
              <StatPill value={productCount} label="Products tracked" />
              <StatPill value={rateCount} label="Rate tiers" />
              {topRate && (
                <StatPill
                  value={`${topRate.pct.toFixed(2)}%`}
                  label={`Top rate · ${topRate.product}`}
                  highlight
                />
              )}
            </div>
          )}
        </Container>
      </section>

      <Container className="py-12 sm:py-16 space-y-14">
        {trending.length > 0 && <TrendingWidget products={trending} />}

        {!hasAnyData && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
            No institutions have been added yet. Once the admin adds institutions and rates, they
            will appear here.
          </div>
        )}

        {SECTION_ORDER.map((type) => {
          const list = bySection.get(type) ?? [];
          if (list.length === 0) return null;
          const style = institutionTypeStyle[type];
          const Icon = style.icon;
          return (
            <section key={type} className="space-y-5">
              <div className="flex items-center gap-3">
                <span className={`grid h-9 w-9 place-items-center rounded-lg ${style.iconWrap}`}>
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <h2 className="font-display text-xl font-bold tracking-tight">
                  {institutionTypeLabels[type]}
                </h2>
                <span className="text-sm text-muted">{list.length}</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((inst) => (
                  <div
                    key={inst.id}
                    className={`group rounded-2xl card-surface p-5 space-y-4 shadow-sm hover:shadow-xl hover:-translate-y-1 ring-1 ring-transparent hover:ring-2 transition-all duration-200 ${style.ring}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <InstitutionLogo name={inst.name} type={inst.type} size="md" />
                        <h3 className="font-display font-semibold leading-snug min-w-0">{inst.name}</h3>
                      </div>
                      {inst.website && (
                        <a
                          href={inst.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 grid h-7 w-7 place-items-center rounded-full text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
                          aria-label={`${inst.name} website`}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    {inst.products.length === 0 ? (
                      <p className="text-sm text-muted">Rate data not yet added.</p>
                    ) : (
                      <ul className="space-y-2">
                        {inst.products.map((product) => {
                          const best = bestRateForProduct(product.rateTiers);
                          return (
                            <li key={product.id} className="flex items-center justify-between text-sm gap-2">
                              <span className="min-w-0 flex-1 truncate text-muted" title={product.name}>
                                {product.name}
                              </span>
                              {best !== null ? (
                                <span
                                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${style.badge}`}
                                >
                                  up to {best.toFixed(2)}%
                                </span>
                              ) : (
                                <span className="shrink-0 text-muted">—</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </Container>
    </div>
  );
}

function StatPill({
  value,
  label,
  highlight = false,
}: {
  value: string | number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl px-4 py-3 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 ${
        highlight
          ? "bg-accent text-accent-ink shadow-md shadow-black/10 hover:shadow-lg"
          : "bg-white/10 hover:bg-white/15"
      }`}
    >
      <div className="font-display text-xl sm:text-2xl font-bold tabular-nums">{value}</div>
      <div className={`text-xs mt-0.5 ${highlight ? "text-accent-ink/80" : "text-white/70"}`}>{label}</div>
    </div>
  );
}
