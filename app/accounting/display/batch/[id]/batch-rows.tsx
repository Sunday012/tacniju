"use client"

import { useMemo, useState } from "react"
import { Plus } from "lucide-react"

export function BatchRows({
  rows,
}: {
  rows: Array<{ itemName: string; qty: number | string; rate: number | string }>
}) {
  const startingRows = useMemo(() => Math.max(10, rows.length), [rows.length])
  const [rowCount, setRowCount] = useState(startingRows)

  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rowCount }, (_, index) => {
        const row = rows[index]
        return (
          <div key={index} className="grid md:grid-cols-[1fr_120px_120px]">
            <div className="border-b border-slate-100 md:border-b-0 md:border-r">
              <input
                name={`item_${index}`}
                list="batch-items"
                defaultValue={row?.itemName || ""}
                placeholder="Select item"
                className="h-10 w-full bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:bg-indigo-50/40"
              />
            </div>
            <div className="border-b border-slate-100 md:border-b-0 md:border-r">
              <input
                name={`qty_${index}`}
                type="number"
                min="0"
                step="0.01"
                defaultValue={row?.qty || ""}
                placeholder="0.00"
                className="h-10 w-full bg-white px-3 text-right font-mono text-sm font-bold text-slate-900 outline-none focus:bg-indigo-50/40"
              />
            </div>
            <input
              name={`rate_${index}`}
              type="number"
              min="0"
              step="0.01"
              defaultValue={row?.rate || ""}
              placeholder="Rate"
              className="h-10 w-full bg-white px-3 text-right font-mono text-sm font-bold text-slate-900 outline-none focus:bg-indigo-50/40"
            />
          </div>
        )
      })}
      <div className="bg-slate-50 px-3 py-3">
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
