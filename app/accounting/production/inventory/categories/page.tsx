import { AccountingShell } from "@/components/accounting/accounting-shell"
import { createProductionCategory, getProductionCategories } from "../../actions"
import { FolderTree } from "lucide-react"
import { CategoryActions } from "@/components/accounting/production/CategoryActions"

export default async function ProductionCategoriesPage() {
  const { rows, error } = await getProductionCategories()

  return (
    <AccountingShell title="Production Categories" backHref="/accounting/production/inventory" backLabel="Production Inventory">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
            <FolderTree className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">Create Category</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Group raw materials, finished goods, and production services.</p>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-700">
            Production category tables are not ready yet. Run `scripts/070_repair_production_inventory.sql` in Supabase.
          </div>
        ) : (
          <>
            <form action={createProductionCategory} className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
              <label className="grid gap-1.5 text-sm font-bold text-slate-600">
                Category name
                <input name="name" required className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" placeholder="Raw Materials" />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-slate-600">
                Description
                <input name="description" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" placeholder="Optional" />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-slate-600">
                Stock group number
                <input name="tracking_number" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono outline-none focus:border-indigo-300 focus:bg-white" placeholder="SGR-00001" />
              </label>
              <button className="mt-auto h-11 rounded-xl bg-indigo-600 px-5 font-black text-white shadow-sm hover:bg-indigo-700">
                Save Category
              </button>
            </form>

            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Description</th>
                    <th className="px-5 py-3">Group No.</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-8 text-center font-medium text-slate-500">No categories have been created yet.</td></tr>
                  ) : rows.map(category => (
                    <tr key={category.id}>
                      <td className="px-5 py-4 font-bold text-slate-800">{category.name}</td>
                      <td className="px-5 py-4 text-slate-500">{category.description || "-"}</td>
                      <td className="px-5 py-4 font-mono text-xs text-indigo-600">{category.tracking_number || "-"}</td>
                      <td className="px-5 py-4 font-bold text-emerald-600">{category.active ? "Active" : "Inactive"}</td>
                      <td className="px-5 py-4 text-right">
                        <CategoryActions category={category} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </AccountingShell>
  )
}
