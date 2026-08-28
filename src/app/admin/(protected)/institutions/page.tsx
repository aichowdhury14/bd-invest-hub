import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { institutionTypeLabels } from "@/lib/labels";
import { createInstitution } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export default async function AdminInstitutionsPage() {
  const institutions = await prisma.institution.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold tracking-tight">Institutions</h1>

      <form
        action={createInstitution}
        className="rounded-2xl card-surface shadow-sm p-5 grid grid-cols-1 gap-3 sm:grid-cols-4 items-end"
      >
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-semibold">Name</label>
          <input
            name="name"
            required
            className="w-full rounded-xl border border-border bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-end"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold">Type</label>
          <select
            name="type"
            className="w-full rounded-xl border border-border bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-end"
          >
            <option value="BANK">Bank</option>
            <option value="GOVERNMENT">Government</option>
            <option value="INVESTMENT_ORG">Investment Organization</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold">Website (optional)</label>
          <input
            name="website"
            placeholder="https://…"
            className="w-full rounded-xl border border-border bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-end"
          />
        </div>
        <button
          type="submit"
          className="sm:col-span-4 justify-self-start rounded-xl brand-gradient px-4 py-2 text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
        >
          Add institution
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl card-surface shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-foreground/[0.03] text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Products</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {institutions.map((inst) => (
              <tr key={inst.id} className="border-t border-border">
                <td className="px-4 py-3 font-semibold">{inst.name}</td>
                <td className="px-4 py-3">{institutionTypeLabels[inst.type]}</td>
                <td className="px-4 py-3">{inst._count.products}</td>
                <td className="px-4 py-3">
                  {inst.isActive ? (
                    <span className="text-emerald-600 dark:text-emerald-400">Active</span>
                  ) : (
                    <span className="text-muted">Hidden</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/institutions/${inst.id}`}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
            {institutions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted">
                  No institutions yet — add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
