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

function Lines({ lines, side }: { lines: StockReportLine[]; side: "in" | "out" }) {
  const color = side === "in" ? "text-emerald-600" : "text-red-600"

  return (
    <>
      {lines.length === 0 ? (
        <tr>
          <td colSpan={3} className="px-3 py-8 text-sm text-slate-400">No entries</td>
        </tr>
      ) : lines.map(line => (
        <tr key={line.itemId} className="border-b border-slate-100 text-sm last:border-b-0">
          <td className="min-w-[220px] px-3 py-3 font-semibold text-slate-800">{line.itemName}</td>
          <td className={`px-3 py-3 text-right font-mono font-semibold ${color}`}>{qty(line.qty)}</td>
          <td className="px-3 py-3 text-right font-mono text-xs font-semibold text-slate-500">{line.entries.toLocaleString()}</td>
        </tr>
      ))}
    </>
  )
}

function ReportSide({
  title,
  lines,
  side,
}: {
  title: string
  lines: StockReportLine[]
  side: "in" | "out"
}) {
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-300 bg-slate-50">
          <th colSpan={3} className="px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-700">
            {title}
          </th>
        </tr>
        <tr className="border-b border-slate-200 bg-white text-xs font-black uppercase tracking-widest text-slate-500">
          <th className="px-3 py-2">Item</th>
          <th className="px-3 py-2 text-right">Qty</th>
          <th className="px-3 py-2 text-right">Entries</th>
        </tr>
      </thead>
      <tbody>
        <Lines lines={lines} side={side} />
      </tbody>
    </table>
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
      <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white shadow-sm">
        <div className="min-w-[760px]">
          <div className="grid min-h-[520px] grid-cols-2">
            <div className="border-r border-slate-300">
              <ReportSide title="Stock In" lines={stockIn} side="in" />
            </div>
            <div>
              <ReportSide title="Stock Out" lines={stockOut} side="out" />
            </div>
          </div>
          <div className="grid grid-cols-2 border-t border-slate-300 bg-slate-50 text-sm font-black">
            <div className="grid grid-cols-[minmax(0,1fr)_96px_80px] border-r border-slate-300 px-3 py-3">
              <span>Total</span>
              <span className="text-right font-mono">{qty(totalIn)}</span>
              <span />
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_96px_80px] px-3 py-3">
              <span>Total</span>
              <span className="text-right font-mono">{qty(totalOut)}</span>
              <span />
            </div>
          </div>
        </div>
      </div>
    </AccountingShell>
  )
}
