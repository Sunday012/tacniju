"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronRight, Eye, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export type RegisterRow = {
  id: string
  date: string
  dateLabel: string
  voucherNo: string
  type?: string
  party: string
  ledger: string
  amount: number
  href: string
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function money(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function monthMeta(dateIso: string) {
  const [year, month] = (dateIso || "").split("-")
  if (!year || !month) return { key: "0000-00", label: "Undated" }
  const index = Number(month) - 1
  return { key: `${year}-${month}`, label: `${MONTHS[index] || month} ${year}` }
}

type MonthGroup = { key: string; label: string; rows: RegisterRow[]; total: number }

export function VoucherRegisterTable({
  rows,
  partyLabel,
  ledgerLabel,
  emptyLabel,
  typeLabel,
}: {
  rows: RegisterRow[]
  partyLabel: string
  ledgerLabel: string
  emptyLabel: string
  typeLabel?: string
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const showType = Boolean(typeLabel)
  const columnCount = showType ? 7 : 6

  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return rows
    return rows.filter(row =>
      [row.voucherNo, row.party, row.ledger, row.dateLabel, row.type || "", String(row.amount)]
        .some(value => value.toLowerCase().includes(term))
    )
  }, [rows, query])

  const monthGroups = useMemo(() => {
    const groups = new Map<string, MonthGroup>()
    for (const row of filteredRows) {
      const meta = monthMeta(row.date)
      const existing = groups.get(meta.key)
      if (existing) {
        existing.rows.push(row)
        existing.total += row.amount
      } else {
        groups.set(meta.key, { key: meta.key, label: meta.label, rows: [row], total: row.amount })
      }
    }
    return Array.from(groups.values())
  }, [filteredRows])

  function toggleMonth(key: string) {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-800/50">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {filteredRows.length} transaction{filteredRows.length === 1 ? "" : "s"}
          {query.trim() && rows.length !== filteredRows.length ? ` of ${rows.length}` : ""}
          {monthGroups.length > 0 ? ` · ${monthGroups.length} month${monthGroups.length === 1 ? "" : "s"}` : ""}
        </p>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search voucher, party, ledger..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">{emptyLabel}</div>
      ) : filteredRows.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
          No transactions match &ldquo;{query}&rdquo;.
        </div>
      ) : (
        <Table>
          <TableHeader className="bg-white dark:bg-slate-900 [&_th]:h-10 [&_th]:px-4 [&_th]:text-[11px] [&_th]:font-black [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-500 dark:[&_th]:text-slate-400">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Voucher No.</TableHead>
              {showType && <TableHead>{typeLabel}</TableHead>}
              <TableHead>{partyLabel}</TableHead>
              <TableHead>{ledgerLabel}</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-16 text-right">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_td]:px-4 [&_td]:py-3">
            {monthGroups.map(group => {
              const isCollapsed = collapsed.has(group.key)
              return [
                <TableRow
                  key={`month-${group.key}`}
                  onClick={() => toggleMonth(group.key)}
                  className="cursor-pointer border-y border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-800"
                >
                  <TableCell colSpan={columnCount - 1} className="py-2.5">
                    <div className="flex items-center gap-2">
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      )}
                      <span className="text-sm font-black uppercase tracking-wide text-slate-700 dark:text-slate-200">{group.label}</span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-400">
                        {group.rows.length} voucher{group.rows.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 text-right font-black text-slate-900 dark:text-slate-100">₦{money(group.total)}</TableCell>
                </TableRow>,
                ...(isCollapsed
                  ? []
                  : group.rows.map(row => (
                      <TableRow
                        key={row.id}
                        onClick={() => router.push(row.href)}
                        className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        <TableCell className="whitespace-nowrap font-semibold text-slate-700 dark:text-slate-300">{row.dateLabel}</TableCell>
                        <TableCell className="whitespace-nowrap font-black text-slate-900 dark:text-slate-100">{row.voucherNo}</TableCell>
                        {showType && (
                          <TableCell className="whitespace-nowrap">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${row.type === "Receipt" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"}`}>
                              {row.type}
                            </span>
                          </TableCell>
                        )}
                        <TableCell className="min-w-44 font-semibold text-slate-700 dark:text-slate-300">{row.party}</TableCell>
                        <TableCell className="min-w-44 text-slate-700 dark:text-slate-400">{row.ledger}</TableCell>
                        <TableCell className="whitespace-nowrap text-right font-black text-slate-900 dark:text-slate-100">₦{money(row.amount)}</TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={row.href}
                            onClick={event => event.stopPropagation()}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                            title="Open voucher"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))),
              ]
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
