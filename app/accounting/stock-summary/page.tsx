import { AccountingShell } from "@/components/accounting/accounting-shell"
import { getStockSummaryReport } from "../report-actions"
import Link from "next/link"

function money(value: number) {
  return value ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"
}

function qty(value: number) {
  return value ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-"
}

export default async function StockSummaryPage({ searchParams }: { searchParams?: { category?: string } }) {
  const rows = await getStockSummaryReport()
  const selectedCategory = searchParams?.category
  const visibleRows = selectedCategory ? rows.filter(row => row.category === selectedCategory) : Array.from(rows.reduce((map, row) => {
    const current = map.get(row.category) || { ...row, id: row.category, name: row.category, quantity: 0, inQty: 0, outQty: 0, debitAmount: 0, creditAmount: 0, value: 0, rate: 0, unit: "" }
    current.quantity += row.quantity
    current.inQty += row.inQty
    current.outQty += row.outQty
    current.debitAmount += row.debitAmount
    current.creditAmount += row.creditAmount
    current.value += row.value
    map.set(row.category, current)
    return map
  }, new Map<string, typeof rows[number]>()).values())

  return (
    <AccountingShell title="Stock Summary" framed={false}>
      <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
        {selectedCategory && <div className="border-b border-slate-200 bg-indigo-50 px-3 py-2 text-sm font-bold"><Link href="/accounting/stock-summary" className="text-indigo-700 hover:underline">Back to categories</Link></div>}
        <div className="grid grid-cols-[1fr_130px_130px_150px_150px] border-b border-slate-300 bg-slate-50 px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-700">
          <div>Particulars</div>
          <div className="text-right">Qty In</div>
          <div className="text-right">Qty Out</div>
          <div className="text-right">Debit</div>
          <div className="text-right">Credit</div>
        </div>
        <div className="min-h-[560px] divide-y divide-slate-100">
          {visibleRows.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm font-semibold text-slate-500">No stock entries found.</div>
          ) : visibleRows.map(row => (
            <div key={row.id} className="grid grid-cols-[1fr_130px_130px_150px_150px] px-3 py-1.5 text-sm">
              <div className="font-semibold text-slate-800">
                {selectedCategory ? row.name : <Link href={`/accounting/stock-summary?category=${encodeURIComponent(row.name)}`} className="hover:text-indigo-700 hover:underline">{row.name}</Link>}
                <span className="mt-0.5 block text-[11px] font-medium text-slate-500">Balance: {qty(row.quantity)} {row.unit}</span>
              </div>
              <div className="text-right font-mono text-slate-700">
                {qty(row.inQty)}
              </div>
              <div className="text-right font-mono text-slate-700">{qty(row.outQty)}</div>
              <div className="text-right font-mono font-semibold text-red-600">{money(row.debitAmount)}</div>
              <div className="text-right font-mono font-semibold text-emerald-600">{money(row.creditAmount)}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[1fr_130px_130px_150px_150px] border-t border-slate-300 bg-slate-50 px-3 py-2 text-sm font-black">
          <div>Grand Total</div>
          <div />
          <div />
          <div className="text-right font-mono">{money(visibleRows.reduce((sum, row) => sum + row.debitAmount, 0))}</div>
          <div className="text-right font-mono">{money(visibleRows.reduce((sum, row) => sum + row.creditAmount, 0))}</div>
        </div>
      </div>
    </AccountingShell>
  )
}
