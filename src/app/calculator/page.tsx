import { getActiveInstitutionsWithProducts } from "@/lib/products";
import { serializeProducts } from "@/lib/serialize";
import { CalculatorClient } from "./CalculatorClient";

export const revalidate = 300;

export default async function CalculatorPage() {
  const institutions = await getActiveInstitutionsWithProducts();
  const products = serializeProducts(institutions);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Investment Calculator</h1>
        <p className="text-black/70 dark:text-white/70 mt-1">
          Enter an amount and pick a tenure to compare maturity amounts across every product that
          offers that exact tenure.
        </p>
      </div>
      <CalculatorClient products={products} />
    </div>
  );
}
