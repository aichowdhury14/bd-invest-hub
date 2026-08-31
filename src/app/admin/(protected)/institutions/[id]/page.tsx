import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { productTypeLabels } from "@/lib/labels";
import { islamicBadgeClass } from "@/lib/institution-style";
import {
  createProduct,
  createProfitSharingRatio,
  createRateTier,
  deleteInstitution,
  deleteProduct,
  deleteProfitSharingRatio,
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
        include: {
          rateTiers: { orderBy: { tenureMonths: "asc" } },
          profitSharingRatios: { orderBy: { tenureMonths: "asc" } },
        },
      },
    },
  });
  if (!institution) notFound();

  const updateInstitutionWithId = updateInstitution.bind(null, id);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight">{institution.name}</h1>
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
        className="rounded-2xl card-surface shadow-sm p-5 grid grid-cols-1 gap-3 sm:grid-cols-4 items-end"
      >
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium">Name</label>
          <input
            name="name"
            defaultValue={institution.name}
            required
            className="w-full rounded-xl border border-border bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-end"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Type</label>
          <select
            name="type"
            defaultValue={institution.type}
            className="w-full rounded-xl border border-border bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-end"
          >
            <option value="BANK">Bank</option>
            <option value="DIGITAL_BANK">Digital Bank</option>
            <option value="GOVERNMENT">Government</option>
            <option value="INVESTMENT_ORG">Investment Organization</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Website</label>
          <input
            name="website"
            defaultValue={institution.website ?? ""}
            className="w-full rounded-xl border border-border bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-end"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl brand-gradient px-4 py-2 text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
        >
          Save changes
        </button>
        <ToggleActiveButton id={id} isActive={institution.isActive} />
      </form>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold">Products</h2>

        <form
          action={createProduct.bind(null, id)}
          className="rounded-2xl card-surface shadow-sm p-5 grid grid-cols-1 gap-3 sm:grid-cols-6 items-end"
        >
          <div className="space-y-1 sm:col-span-2">
            <label className="text-sm font-medium">Product name</label>
            <input
              name="name"
              required
              placeholder="e.g. Regular FDR"
              className="w-full rounded-xl border border-border bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-end"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Type</label>
            <select
              name="productType"
              className="w-full rounded-xl border border-border bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-end"
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
              className="w-full rounded-xl border border-border bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-end"
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
              className="w-full rounded-xl border border-border bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-end"
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
              className="w-full rounded-xl border border-border bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-end"
            />
          </div>
          <label className="flex items-center gap-2 pb-2 text-sm font-medium">
            <input
              name="isIslamic"
              type="checkbox"
              className="h-4 w-4 rounded accent-current"
              style={{ color: "var(--brand-end)" }}
            />
            Islamic product
          </label>
          <button
            type="submit"
            className="sm:col-span-6 justify-self-start rounded-xl brand-gradient px-4 py-2 text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
          >
            Add product
          </button>
        </form>

        {institution.products.map((product) => (
          <div key={product.id} className="rounded-2xl card-surface shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="flex items-center gap-1.5 font-medium">
                  {product.name}
                  {product.isIslamic && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${islamicBadgeClass}`}>
                      Islamic
                    </span>
                  )}
                </h3>
                <p className="text-xs text-muted">
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
                  <button className="text-muted hover:underline">
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
                <tr className="text-left text-muted">
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
                  <tr key={tier.id} className="border-t border-border row-interactive">
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
              className="grid grid-cols-1 gap-2 sm:grid-cols-5 items-end text-sm"
            >
              <div className="space-y-1">
                <label className="text-xs font-medium">Tenure (mo)</label>
                <input
                  name="tenureMonths"
                  type="number"
                  min={1}
                  required
                  className="w-full rounded-xl border border-border bg-transparent px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-end"
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
                  className="w-full rounded-xl border border-border bg-transparent px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-end"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Max amount (opt.)</label>
                <input
                  name="maxAmount"
                  type="number"
                  min={0}
                  className="w-full rounded-xl border border-border bg-transparent px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-end"
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
                  className="w-full rounded-xl border border-border bg-transparent px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-end"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Source URL (opt.)</label>
                <input
                  name="sourceUrl"
                  className="w-full rounded-xl border border-border bg-transparent px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-end"
                />
              </div>
              <button
                type="submit"
                className="sm:col-span-5 justify-self-start rounded-lg bg-foreground text-background px-3 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Add rate tier
              </button>
            </form>

            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-xs font-medium text-muted">
                Profit-sharing ratio (for Mudaraba products with no published percentage rate)
              </p>
              {product.profitSharingRatios.length > 0 && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted">
                      <th className="pb-1 font-medium">Tenure</th>
                      <th className="pb-1 font-medium">Customer:Bank</th>
                      <th className="pb-1 font-medium">Source</th>
                      <th className="pb-1 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {product.profitSharingRatios.map((ratio) => (
                      <tr key={ratio.id} className="border-t border-border row-interactive">
                        <td className="py-1.5">{ratio.tenureMonths} mo</td>
                        <td className="py-1.5">
                          {ratio.customerRatio}:{ratio.bankRatio}
                        </td>
                        <td className="py-1.5 text-xs">
                          <a
                            href={ratio.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            source
                          </a>
                        </td>
                        <td className="py-1.5 text-right">
                          <form
                            action={async () => {
                              "use server";
                              await deleteProfitSharingRatio(ratio.id, id);
                            }}
                          >
                            <button className="text-red-600 hover:underline text-xs">Delete</button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <form
                action={createProfitSharingRatio.bind(null, product.id, id)}
                className="grid grid-cols-1 gap-2 sm:grid-cols-5 items-end text-sm"
              >
                <div className="space-y-1">
                  <label className="text-xs font-medium">Tenure (mo)</label>
                  <input
                    name="tenureMonths"
                    type="number"
                    min={1}
                    required
                    className="w-full rounded-xl border border-border bg-transparent px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-end"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Customer ratio</label>
                  <input
                    name="customerRatio"
                    type="number"
                    min={0}
                    max={100}
                    required
                    className="w-full rounded-xl border border-border bg-transparent px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-end"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Bank ratio</label>
                  <input
                    name="bankRatio"
                    type="number"
                    min={0}
                    max={100}
                    required
                    className="w-full rounded-xl border border-border bg-transparent px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-end"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium">Source URL (required)</label>
                  <input
                    name="sourceUrl"
                    required
                    className="w-full rounded-xl border border-border bg-transparent px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-end"
                  />
                </div>
                <button
                  type="submit"
                  className="sm:col-span-5 justify-self-start rounded-lg bg-foreground text-background px-3 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Add profit-sharing ratio
                </button>
              </form>
            </div>
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
      <button className="text-sm text-muted hover:underline">
        {isActive ? "Hide from site" : "Show on site"}
      </button>
    </form>
  );
}
