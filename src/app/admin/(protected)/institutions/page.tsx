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
      <h1 className="text-2xl font-bold tracking-tight">Institutions</h1>

      <form
        action={createInstitution}
        className="rounded-lg border border-black/10 dark:border-white/10 p-4 grid gap-3 sm:grid-cols-4 items-end"
      >
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium">Name</label>
          <input
            name="name"
            required
            className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Type</label>
          <select
            name="type"
            className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2"
          >
            <option value="BANK">Bank</option>
            <option value="GOVERNMENT">Government</option>
            <option value="INVESTMENT_ORG">Investment Organization</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Website (optional)</label>
          <input
            name="website"
            placeholder="https://…"
            className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="sm:col-span-4 justify-self-start rounded-md bg-emerald-700 px-4 py-2 text-white text-sm font-medium hover:bg-emerald-800"
        >
          Add institution
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-black/5 dark:bg-white/5 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Products</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {institutions.map((inst) => (
              <tr key={inst.id} className="border-t border-black/10 dark:border-white/10">
                <td className="px-4 py-3 font-medium">{inst.name}</td>
                <td className="px-4 py-3">{institutionTypeLabels[inst.type]}</td>
                <td className="px-4 py-3">{inst._count.products}</td>
                <td className="px-4 py-3">
                  {inst.isActive ? (
                    <span className="text-emerald-700 dark:text-emerald-400">Active</span>
                  ) : (
                    <span className="text-black/40 dark:text-white/40">Hidden</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/institutions/${inst.id}`}
                    className="text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
            {institutions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-black/50 dark:text-white/50">
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
