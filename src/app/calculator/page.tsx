import { Calculator } from "lucide-react";
import { getActiveInstitutionsWithProducts } from "@/lib/products";
import { serializeProducts } from "@/lib/serialize";
import { Container } from "@/components/Container";
import { CalculatorClient } from "./CalculatorClient";

export const revalidate = 300;

export default async function CalculatorPage() {
  const institutions = await getActiveInstitutionsWithProducts();
  const products = serializeProducts(institutions);

  return (
    <div>
      <section className="brand-gradient text-white">
        <Container className="py-10 sm:py-14 space-y-3">
          <span className="inline-grid h-10 w-10 place-items-center rounded-xl bg-white/15">
            <Calculator className="h-5 w-5" />
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Investment Calculator
          </h1>
          <p className="text-white/85 max-w-xl">
            Enter an amount and pick a tenure to compare maturity amounts across every product
            that offers that exact tenure.
          </p>
        </Container>
      </section>
      <Container className="py-10 sm:py-12">
        <CalculatorClient products={products} />
      </Container>
    </div>
  );
}
