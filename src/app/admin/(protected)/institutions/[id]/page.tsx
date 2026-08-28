import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { productTypeLabels } from "@/lib/labels";
import {
  createProduct,
  createRateTier,
  deleteInstitution,
  deleteProduct,
  deleteRateTier,
  toggleInstitutionActive,
  toggleProductActive,
  updateInstitution,
} from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export default async function AdminInstitutionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const institution = await prisma.institution.findUnique({
    where: { id },
    include: {
      products: {
        orderBy: { productType: "asc" },
        include: { rateTiers: { orderBy: { tenureMonths: "asc" } } },
      },
    },
  });
  if (!institution) notFound();

  const updateInstitutionWithId = updateInstitution.bind(null, id);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{institution.name}</h1>
        <form
          action={async () => {
            "use server";
            await deleteInstitution(id);
          }}
        >
          <button className="text-sm text-red-600 hover:underline">Delete institution</button>
        </form>
      </div>

      <form
        action={updateInstitutionWithId}
        className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-3 sm:grid-cols-4 items-end"
      >
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium">Name</label>
          <input
            name="name"
            defaultValue={institution.name}
            required
            className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Type</label>
          <select
            name="type"
            defaultValue={institution.type}
            className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2"
          >
            <option value="BANK">Bank</option>
            <option value="GOVERNMENT">Government</option>
            <option value="INVESTMENT_ORG">Investment Organization</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Website</label>
          <input
            name="website"
            defaultValue={institution.website ?? ""}
            className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-emerald-700 px-4 py-2 text-white text-sm font-medium hover:bg-emerald-800"
        >
          Save changes
        </button>
        <ToggleActiveButton id={id} isActive={institution.isActive} />
      </form>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Products</h2>

        <form
          action={createProduct.bind(null, id)}
          className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-3 sm:grid-cols-6 items-end"
        >
          <div className="space-y-1 sm:col-span-2">
            <label className="text-sm font-medium">Product name</label>
            <input
              name="name"
              required
              placeholder="e.g. Regular FDR"
              className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Type</label>
            <select
              name="productType"
              className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2"
            >
              {Object.entries(productTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Compounding</label>
            <select
              name="compounding"
              defaultValue="QUARTERLY"
              className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2"
            >
              <option value="SIMPLE">Simple</option>
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Min tenure (mo)</label>
            <input
              name="minTenureMonths"
              type="number"
              min={1}
              defaultValue={3}
              required
              className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Max tenure (mo)</label>
            <input
              name="maxTenureMonths"
              type="number"
              min={1}
              defaultValue={36}
              required
              className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="sm:col-span-6 justify-self-start rounded-md bg-emerald-700 px-4 py-2 text-white text-sm font-medium hover:bg-emerald-800"
          >
            Add product
          </button>
        </form>

        {institution.products.map((product) => (
          <div key={product.id} className="rounded-lg border border-black/10 dark:border-white/10 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-xs text-black/50 dark:text-white/50">
                  {productTypeLabels[product.productType]} · {product.compounding} compounding ·{" "}
                  {product.minTenureMonths}–{product.maxTenureMonths} mo
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <form
                  action={async () => {
                    "use server";
                    await toggleProductActive(product.id, id, !product.isActive);
                  }}
                >
                  <button className="text-black/60 dark:text-white/60 hover:underline">
                    {product.isActive ? "Hide" : "Show"}
                  </button>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await deleteProduct(product.id, id);
                  }}
                >
                  <button className="text-red-600 hover:underline">Delete</button>
                </form>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-black/50 dark:text-white/50">
                  <th className="pb-1 font-medium">Tenure</th>
                  <th className="pb-1 font-medium">Min amount</th>
                  <th className="pb-1 font-medium">Max amount</th>
                  <th className="pb-1 font-medium">Rate %</th>
                  <th className="pb-1 font-medium">Source</th>
                  <th className="pb-1 font-medium" />
                </tr>
              </thead>
              <tbody>
                {product.rateTiers.map((tier) => (
                  <tr key={tier.id} className="border-t border-black/10 dark:border-white/10">
                    <td className="py-1.5">{tier.tenureMonths} mo</td>
                    <td className="py-1.5">{Number(tier.minAmount).toLocaleString()}</td>
                    <td className="py-1.5">
                      {tier.maxAmount ? Number(tier.maxAmount).toLocaleString() : "—"}
                    </td>
                    <td className="py-1.5">{Number(tier.interestRatePct).toFixed(2)}%</td>
                    <td className="py-1.5 text-xs">{tier.source}</td>
                    <td className="py-1.5 text-right">
                      <form
                        action={async () => {
                          "use server";
                          await deleteRateTier(tier.id, id);
                        }}
                      >
                        <button className="text-red-600 hover:underline text-xs">Delete</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <form
              action={createRateTier.bind(null, product.id, id)}
              className="grid gap-2 sm:grid-cols-5 items-end text-sm"
            >
              <div className="space-y-1">
                <label className="text-xs font-medium">Tenure (mo)</label>
                <input
                  name="tenureMonths"
                  type="number"
                  min={1}
                  required
                  className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-2 py-1.5"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Min amount</label>
                <input
                  name="minAmount"
                  type="number"
                  min={0}
                  defaultValue={0}
                  required
                  className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-2 py-1.5"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Max amount (opt.)</label>
                <input
                  name="maxAmount"
                  type="number"
                  min={0}
                  className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-2 py-1.5"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Rate %</label>
                <input
                  name="interestRatePct"
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  required
                  className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-2 py-1.5"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Source URL (opt.)</label>
                <input
                  name="sourceUrl"
                  className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-2 py-1.5"
                />
              </div>
              <button
                type="submit"
                className="sm:col-span-5 justify-self-start rounded-md bg-black/80 dark:bg-white/80 dark:text-black px-3 py-1.5 text-white text-xs font-medium hover:opacity-90"
              >
                Add rate tier
              </button>
            </form>
          </div>
        ))}
      </section>
    </div>
  );
}

function ToggleActiveButton({ id, isActive }: { id: string; isActive: boolean }) {
  return (
    <form
      action={async () => {
        "use server";
        await toggleInstitutionActive(id, !isActive);
      }}
    >
      <button className="text-sm text-black/60 dark:text-white/60 hover:underline">
        {isActive ? "Hide from site" : "Show on site"}
      </button>
    </form>
  );
}
