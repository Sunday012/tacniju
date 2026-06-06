import { AccountingShell } from "@/components/accounting/accounting-shell"
import { Ruler } from "lucide-react"

export default function ProductionUnitsPage() {
  return (
    <AccountingShell title="Units" backHref="/accounting/production/inventory" backLabel="Production Inventory">
      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <Ruler className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-extrabold text-slate-800">Create Unit</h2>
          </div>
          <div className="grid gap-4">
            {["Unit name", "Short name", "Decimal places"].map(label => (
              <label key={label} className="grid gap-1.5 text-sm font-bold text-slate-600">
                {label}
                <input className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" placeholder={label} />
              </label>
            ))}
            <button className="mt-2 h-11 rounded-xl bg-indigo-600 font-black text-white shadow-sm hover:bg-indigo-700">
              Save Unit
            </button>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-800">Available Units</h2>
          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <p className="font-bold text-slate-500">No units have been created yet.</p>
          </div>
        </section>
      </div>
    </AccountingShell>
  )
}
