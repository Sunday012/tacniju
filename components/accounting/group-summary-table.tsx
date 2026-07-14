"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export type GroupSummaryRow = {
  id: string
  name: string
  nature: string
  ledgerCount: number
  debit: number
  credit: number
  href: string
}

function money(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function GroupSummaryTable({ rows, emptyLabel }: { rows: GroupSummaryRow[]; emptyLabel: string }) {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return rows
    return rows.filter(row => [row.name, row.nature].some(value => value.toLowerCase().includes(term)))
  }, [rows, query])

  const totalDebit = filteredRows.reduce((sum, row) => sum + row.debit, 0)
  const totalCredit = filteredRows.reduce((sum, row) => sum + row.credit, 0)

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-800/50">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {filteredRows.length} group{filteredRows.length === 1 ? "" : "s"}
          {query.trim() && rows.length !== filteredRows.length ? ` of ${rows.length}` : ""}
        </p>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search groups..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">{emptyLabel}</div>
      ) : filteredRows.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
          No groups match &ldquo;{query}&rdquo;.
        </div>
      ) : (
        <Table>
          <TableHeader className="bg-white dark:bg-slate-900 [&_th]:h-10 [&_th]:px-4 [&_th]:text-[11px] [&_th]:font-black [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-500 dark:[&_th]:text-slate-400">
            <TableRow>
              <TableHead>Group</TableHead>
              <TableHead>Nature</TableHead>
              <TableHead className="text-right">Ledgers</TableHead>
              <TableHead className="text-right">Debit (₦)</TableHead>
              <TableHead className="text-right">Credit (₦)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_td]:px-4 [&_td]:py-3">
            {filteredRows.map(row => (
              <TableRow
                key={row.id}
                onClick={() => router.push(row.href)}
                className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <TableCell className="min-w-44 font-black text-slate-900 dark:text-slate-100">{row.name}</TableCell>
                <TableCell className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{row.nature}</TableCell>
                <TableCell className="text-right font-semibold text-slate-600 dark:text-slate-400">{row.ledgerCount}</TableCell>
                <TableCell className="whitespace-nowrap text-right font-mono font-bold text-red-600 dark:text-red-400">
                  {row.debit > 0 ? money(row.debit) : "-"}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {row.credit > 0 ? money(row.credit) : "-"}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t-2 border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60">
              <TableCell colSpan={3} className="text-right text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">
                Total
              </TableCell>
              <TableCell className="whitespace-nowrap text-right font-mono text-base font-black text-red-600 dark:text-red-400">
                {money(totalDebit)}
              </TableCell>
              <TableCell className="whitespace-nowrap text-right font-mono text-base font-black text-emerald-600 dark:text-emerald-400">
                {money(totalCredit)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </div>
  )
}
