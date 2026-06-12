import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getKitchenStockRows } from "@/app/accounting/production/actions"

export const dynamic = "force-dynamic"

function money(value: number) {
  return value ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"
}

function qty(value: number) {
  return value ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-"
}

export default async function DiningHallKitchenPage() {
  const rows = await getKitchenStockRows()
  const totalValue = rows.reduce((sum, row) => sum + row.value, 0)

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <Link
            href="/admin/dining-hall"
            className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 text-sm font-black text-indigo-700 shadow-sm hover:bg-indigo-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dining Hall
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Kitchen</h1>
          <p className="mt-1 font-medium text-slate-500">Final food saved from Stock Journal.</p>
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
          <div className="grid grid-cols-[1fr_150px_120px_160px] border-b border-slate-300 bg-slate-50 px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-700">
            <div>Final Food</div>
            <div className="text-right">Quantity</div>
            <div className="text-right">Rate</div>
            <div className="text-right">Value</div>
          </div>
          <div className="min-h-[560px] divide-y divide-slate-100">
            {rows.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm font-semibold text-slate-500">
                No final food has been saved from the Stock Journal yet.
              </div>
            ) : rows.map(row => (
              <div key={row.itemId} className="grid grid-cols-[1fr_150px_120px_160px] px-3 py-1.5 text-sm">
                <div className="font-semibold text-slate-800">{row.name}</div>
                <div className="text-right font-mono text-slate-700">
                  {qty(row.quantity)} {row.unit}
                </div>
                <div className="text-right font-mono text-slate-700">{money(row.rate)}</div>
                <div className="text-right font-mono font-semibold text-slate-900">{money(row.value)}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[1fr_150px_120px_160px] border-t border-slate-300 bg-slate-50 px-3 py-2 text-sm font-black">
            <div>Grand Total</div>
            <div />
            <div />
            <div className="text-right font-mono">{money(totalValue)}</div>
          </div>
        </section>
      </div>
    </div>
  )
}
