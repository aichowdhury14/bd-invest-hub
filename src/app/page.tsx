import Link from "next/link";
import { getActiveInstitutionsWithProducts, bestRateForProduct } from "@/lib/products";
import { institutionTypeLabels, productTypeLabels } from "@/lib/labels";
import type { InstitutionType } from "@prisma/client";

export const revalidate = 300;

const SECTION_ORDER: InstitutionType[] = ["BANK", "GOVERNMENT", "INVESTMENT_ORG"];

export default async function HomePage() {
  const institutions = await getActiveInstitutionsWithProducts();
  const bySection = new Map<InstitutionType, typeof institutions>();
  for (const type of SECTION_ORDER) bySection.set(type, []);
  for (const inst of institutions) {
    bySection.get(inst.type)?.push(inst);
  }

  const hasAnyData = institutions.length > 0;

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Compare FDR, DPS &amp; savings rates across Bangladesh
        </h1>
        <p className="text-black/70 dark:text-white/70 max-w-2xl">
          Browse current rates from banks, Bangladesh Bank savings instruments, and investment
          organizations — then use the calculator to see your maturity amount for any deposit and
          tenure.
        </p>
        <Link
          href="/calculator"
          className="inline-flex items-center rounded-md bg-emerald-700 px-4 py-2 text-white text-sm font-medium hover:bg-emerald-800 transition-colors"
        >
          Open the calculator →
        </Link>
      </section>

      {!hasAnyData && (
        <div className="rounded-lg border border-dashed border-black/20 dark:border-white/20 p-8 text-center text-black/60 dark:text-white/60">
          No institutions have been added yet. Once the admin adds institutions and rates, they
          will appear here.
        </div>
      )}

      {SECTION_ORDER.map((type) => {
        const list = bySection.get(type) ?? [];
        if (list.length === 0) return null;
        return (
          <section key={type} className="space-y-4">
            <h2 className="text-xl font-semibold">{institutionTypeLabels[type]}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((inst) => (
                <div
                  key={inst.id}
                  className="rounded-lg border border-black/10 dark:border-white/10 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{inst.name}</h3>
                    {inst.website && (
                      <a
                        href={inst.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline"
                      >
                        Website
                      </a>
                    )}
                  </div>
                  {inst.products.length === 0 ? (
                    <p className="text-sm text-black/50 dark:text-white/50">
                      Rate data not yet added.
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {inst.products.map((product) => {
                        const best = bestRateForProduct(product.rateTiers);
                        return (
                          <li
                            key={product.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-black/70 dark:text-white/70">
                              {productTypeLabels[product.productType]}
                            </span>
                            <span className="font-medium tabular-nums">
                              {best !== null ? `up to ${best.toFixed(2)}%` : "—"}
                            </span>
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
    </div>
  );
}
