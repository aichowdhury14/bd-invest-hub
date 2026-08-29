import { Suspense } from "react";
import { GitCompareArrows } from "lucide-react";
import { getActiveInstitutionsWithProducts } from "@/lib/products";
import { serializeProducts } from "@/lib/serialize";
import { Container } from "@/components/Container";
import { CompareClient } from "./CompareClient";

export const revalidate = 300;

export default async function ComparePage() {
  const institutions = await getActiveInstitutionsWithProducts();
  const products = serializeProducts(institutions).filter((p) => p.rateTiers.length > 0);

  return (
    <div>
      <section className="brand-gradient text-white">
        <Container className="py-10 sm:py-14 space-y-3">
          <span className="inline-grid h-10 w-10 place-items-center rounded-xl bg-white/15">
            <GitCompareArrows className="h-5 w-5" />
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Compare Products
          </h1>
          <p className="text-white/85 max-w-xl">
            Filter, sort, and pick up to 6 products to see maturity amounts and full rate tiers
            side by side — for any amount and tenure you choose.
          </p>
        </Container>
      </section>
      <Container className="py-10 sm:py-12">
        <Suspense fallback={null}>
          <CompareClient products={products} />
        </Suspense>
      </Container>
    </div>
  );
}
