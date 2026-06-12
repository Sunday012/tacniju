import { AccountingShell } from "@/components/accounting/accounting-shell"
import { getKitchenStockRows } from "../actions"

function money(value: number) {
  return value ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"
}

function qty(value: number) {
  return value ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-"
}

export default async function KitchenPage() {
  const rows = await getKitchenStockRows()
  const totalValue = rows.reduce((sum, row) => sum + row.value, 0)

  return (
    <AccountingShell title="Kitchen" backHref="/accounting/production" backLabel="Production" framed={false}>
      <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
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
      </div>
    </AccountingShell>
  )
}
