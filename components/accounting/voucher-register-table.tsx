"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export type RegisterRow = {
  id: string
  dateLabel: string
  voucherNo: string
  type?: string
  party: string
  ledger: string
  amount: number
  href: string
}

function money(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

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
  const showType = Boolean(typeLabel)

  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return rows
    return rows.filter(row =>
      [row.voucherNo, row.party, row.ledger, row.dateLabel, row.type || "", String(row.amount)]
        .some(value => value.toLowerCase().includes(term))
    )
  }, [rows, query])

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-slate-500">
          {filteredRows.length} transaction{filteredRows.length === 1 ? "" : "s"}
          {query.trim() && rows.length !== filteredRows.length ? ` of ${rows.length}` : ""}
        </p>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search voucher, party, ledger..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm font-semibold text-slate-500">{emptyLabel}</div>
      ) : filteredRows.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
          No transactions match &ldquo;{query}&rdquo;.
        </div>
      ) : (
        <Table>
          <TableHeader className="bg-white [&_th]:h-10 [&_th]:px-4 [&_th]:text-[11px] [&_th]:font-black [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-500">
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
            {filteredRows.map(row => (
              <TableRow
                key={row.id}
                onClick={() => router.push(row.href)}
                className="cursor-pointer hover:bg-slate-50"
              >
                <TableCell className="whitespace-nowrap font-semibold text-slate-700">{row.dateLabel}</TableCell>
                <TableCell className="whitespace-nowrap font-black text-slate-900">{row.voucherNo}</TableCell>
                {showType && (
                  <TableCell className="whitespace-nowrap">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${row.type === "Receipt" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {row.type}
                    </span>
                  </TableCell>
                )}
                <TableCell className="min-w-44 font-semibold text-slate-700">{row.party}</TableCell>
                <TableCell className="min-w-44 text-slate-700">{row.ledger}</TableCell>
                <TableCell className="whitespace-nowrap text-right font-black text-slate-900">₦{money(row.amount)}</TableCell>
                <TableCell className="text-right">
                  <Link
                    href={row.href}
                    onClick={event => event.stopPropagation()}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                    title="View voucher"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
