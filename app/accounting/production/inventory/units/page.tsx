"use client"

import { AccountingShell } from "@/components/accounting/accounting-shell"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Plus, Ruler } from "lucide-react"

export default function ProductionUnitsPage() {
  return (
    <AccountingShell title="Units" backHref="/accounting/production/inventory" backLabel="Production Inventory">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">Available Units</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Units created for production inventory will appear here.</p>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 font-black text-white shadow-sm transition hover:bg-indigo-700">
                <Plus className="h-4 w-4" />
                Create Unit
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full overflow-y-auto border-slate-200 bg-slate-50 p-0 text-slate-900 sm:max-w-xl">
              <SheetHeader className="border-b border-slate-200 bg-white px-6 py-5">
                <SheetTitle className="flex items-center gap-3 text-xl font-black text-slate-900">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
                    <Ruler className="h-5 w-5" />
                  </span>
                  Create Unit
                </SheetTitle>
              </SheetHeader>

              <div className="p-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
          <p className="font-bold text-slate-500">No units have been created yet.</p>
        </div>
      </section>
    </AccountingShell>
  )
}
