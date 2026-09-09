import { AccountingShell } from "@/components/accounting/accounting-shell"
import { getStockJournalDiaryRows } from "@/app/accounting/production/actions"

function qty(value: number) {
  return value ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-"
}

type StockReportLine = {
  itemId: string
  itemName: string
  qty: number
  entries: number
}

function Lines({ lines }: { lines: StockReportLine[] }) {
  return (
    <div className="divide-y divide-slate-100">
      {lines.length === 0 ? (
        <div className="grid grid-cols-[1fr_120px_120px] px-3 py-2 text-sm text-slate-400">
          <span>No entries</span>
          <span />
          <span />
        </div>
      ) : lines.map(line => (
        <div key={line.itemId} className="grid grid-cols-[1fr_120px_120px] px-3 py-2 text-sm">
          <span className="font-semibold text-slate-800">{line.itemName}</span>
          <span className="text-right font-mono font-semibold text-slate-900">{qty(line.qty)}</span>
          <span className="text-right font-mono text-xs font-semibold text-slate-500">{line.entries.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export default async function InventoryReportsPage() {
  const rows = await getStockJournalDiaryRows()
  const stockIn = Array.from(rows.filter(row => row.movementType === "IN").reduce((map, row) => {
    const current = map.get(row.itemId) || {
      itemId: row.itemId,
      itemName: row.itemName,
      qty: 0,
      entries: 0,
    }

    current.qty += row.qty
    current.entries += 1
    map.set(row.itemId, current)
    return map
  }, new Map<string, StockReportLine>()).values())
    .sort((a, b) => a.itemName.localeCompare(b.itemName))

  const stockOut = Array.from(rows.filter(row => row.movementType === "OUT").reduce((map, row) => {
    const current = map.get(row.itemId) || {
      itemId: row.itemId,
      itemName: row.itemName,
      qty: 0,
      entries: 0,
    }

    current.qty += row.qty
    current.entries += 1
    map.set(row.itemId, current)
    return map
  }, new Map<string, StockReportLine>()).values())
    .sort((a, b) => a.itemName.localeCompare(b.itemName))

  const totalIn = stockIn.reduce((sum, row) => sum + row.qty, 0)
  const totalOut = stockOut.reduce((sum, row) => sum + row.qty, 0)

  return (
    <AccountingShell title="Inventory Reports" backHref="/accounting/inventory" backLabel="Inventory Info">
      <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
        <div className="grid border-b border-slate-300 bg-slate-50 md:grid-cols-2">
          <div className="border-b border-slate-300 px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-700 md:border-b-0 md:border-r">Stock In</div>
          <div className="px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-700">Stock Out</div>
        </div>
        <div className="grid min-h-[520px] md:grid-cols-2">
          <div className="border-b border-slate-300 md:border-b-0 md:border-r">
            <div className="grid grid-cols-[1fr_120px_120px] border-b border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-500">
              <span>Item</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Entries</span>
            </div>
            <Lines lines={stockIn} />
          </div>
          <div>
            <div className="grid grid-cols-[1fr_120px_120px] border-b border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-500">
              <span>Item</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Entries</span>
            </div>
            <Lines lines={stockOut} />
          </div>
        </div>
        <div className="grid border-t border-slate-300 bg-slate-50 text-sm font-black md:grid-cols-2">
          <div className="grid grid-cols-[1fr_120px_120px] border-b border-slate-300 px-3 py-2 md:border-b-0 md:border-r">
            <span>Total</span>
            <span className="text-right font-mono">{qty(totalIn)}</span>
            <span />
          </div>
          <div className="grid grid-cols-[1fr_120px_120px] px-3 py-2">
            <span>Total</span>
            <span className="text-right font-mono">{qty(totalOut)}</span>
            <span />
          </div>
        </div>
      </div>
    </AccountingShell>
  )
}
