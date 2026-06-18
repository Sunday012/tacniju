"use client"

import { useMemo, useState } from "react"
import { Plus } from "lucide-react"

export function JournalRows({
  prefix,
  initialRows = [],
}: {
  prefix: "in" | "out"
  initialRows?: Array<{ itemName: string; qty: number }>
}) {
  const startingRows = useMemo(() => Math.max(10, initialRows.length), [initialRows.length])
  const [rowCount, setRowCount] = useState(startingRows)

  return (
    <div>
      {Array.from({ length: rowCount }, (_, row) => (
        <div key={row} className="grid grid-cols-[minmax(0,1fr)_120px] border-b border-slate-100 last:border-b-0">
          <input
            name={`${prefix}_item_name_${row}`}
            list="production-item-options"
            defaultValue={initialRows?.[row]?.itemName || ""}
            className="h-11 min-w-0 bg-white px-4 text-sm font-medium text-slate-700 outline-none focus:bg-indigo-50/50"
            autoComplete="off"
          />
          <input
            name={`${prefix}_qty_${row}`}
            type="number"
            min="0"
            step="0.01"
            defaultValue={initialRows?.[row]?.qty || ""}
            className="h-11 border-l border-slate-100 px-4 text-right text-sm font-bold text-slate-700 outline-none focus:bg-indigo-50/50"
          />
        </div>
      ))}
      <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
        <button
          type="button"
          onClick={() => setRowCount(count => count + 5)}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 shadow-sm hover:bg-slate-100"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Lines
        </button>
      </div>
    </div>
  )
}
