import { getActiveInstitutionsWithProducts } from "@/lib/products";
import { serializeProducts } from "@/lib/serialize";
import { CompareClient } from "./CompareClient";

export const revalidate = 300;

export default async function ComparePage() {
  const institutions = await getActiveInstitutionsWithProducts();
  const products = serializeProducts(institutions).filter((p) => p.rateTiers.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Compare Products</h1>
        <p className="text-black/70 dark:text-white/70 mt-1">
          Pick up to 4 products to see their full tenure and rate tiers side by side.
        </p>
      </div>
      <CompareClient products={products} />
    </div>
  );
}
