import { AccountingShell } from "@/components/accounting/accounting-shell"
import { createProductionUnit, getProductionUnits } from "../../actions"
import { Ruler } from "lucide-react"
import { UnitActions } from "@/components/accounting/production/UnitActions"

export default async function ProductionUnitsPage() {
  const { rows, error } = await getProductionUnits()

  return (
    <AccountingShell title="Units" backHref="/accounting/production/inventory" backLabel="Production Inventory">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
            <Ruler className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">Create Unit</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Define units such as kg, bag, plate, carton, roll, or piece.</p>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-700">
            Production unit tables are not ready yet. Run `scripts/031_production_access_and_lookup_tables.sql` in Supabase.
          </div>
        ) : (
          <>
            <form action={createProductionUnit} className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px_160px_auto]">
              <label className="grid gap-1.5 text-sm font-bold text-slate-600">
                Unit name
                <input name="name" required className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" placeholder="Kilogram" />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-slate-600">
                Short name
                <input name="short_name" required className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" placeholder="kg" />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-slate-600">
                Decimal places
                <input name="decimal_places" type="number" min="0" max="6" defaultValue="0" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" />
              </label>
              <button className="mt-auto h-11 rounded-xl bg-indigo-600 px-5 font-black text-white shadow-sm hover:bg-indigo-700">
                Save Unit
              </button>
            </form>

            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Unit</th>
                    <th className="px-5 py-3">Short Name</th>
                    <th className="px-5 py-3">Decimals</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-8 text-center font-medium text-slate-500">No units have been created yet.</td></tr>
                  ) : rows.map(unit => (
                    <tr key={unit.id}>
                      <td className="px-5 py-4 font-bold text-slate-800">{unit.name}</td>
                      <td className="px-5 py-4 font-mono text-slate-600">{unit.short_name}</td>
                      <td className="px-5 py-4 text-slate-500">{unit.decimal_places}</td>
                      <td className="px-5 py-4 font-bold text-emerald-600">{unit.active ? "Active" : "Inactive"}</td>
                      <td className="px-5 py-4 text-right">
                        <UnitActions unit={unit} />
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
