import Link from "next/link"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getLedgerStatement, getStatementOptions } from "@/app/accounting/statements/actions"

function money(value: number) {
  return value ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"
}

function formatDate(value: string) {
  return value ? new Date(value).toLocaleDateString("en-GB") : "-"
}

export async function StatementReportPage({
  title,
  optionKind,
  searchParams,
}: {
  title: string
  optionKind: "bank" | "cash" | "ledger" | "party"
  searchParams?: { ledger?: string; start?: string; end?: string }
}) {
  const options = await getStatementOptions(optionKind)
  const selectedLedgerId = searchParams?.ledger || options[0]?.id || ""
  const selectedLedger = options.find(option => option.id === selectedLedgerId)
  const report = await getLedgerStatement(selectedLedgerId, searchParams?.start, searchParams?.end)

  return (
    <AccountingShell title={title} backHref="/accounting/statements" backLabel="Statements" framed={false}>
      <div className="space-y-4">
        <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(220px,1fr)_170px_170px_auto] dark:border-slate-800 dark:bg-slate-900">
          <select name="ledger" defaultValue={selectedLedgerId} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
            {options.length === 0 ? (
              <option value="">No accounts found</option>
            ) : options.map(option => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
          <input name="start" type="date" defaultValue={searchParams?.start || ""} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
          <input name="end" type="date" defaultValue={searchParams?.end || ""} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
          <button className="h-10 rounded-lg bg-indigo-700 px-5 text-sm font-black text-white hover:bg-indigo-800">View</button>
        </form>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Account</p>
            <p className="mt-1 text-lg font-black text-slate-900 dark:text-slate-100">{selectedLedger?.name || "-"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Total Money In</p>
            <p className="mt-1 font-mono text-lg font-black text-emerald-600">₦{money(report.totalDebit)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Total Money Out</p>
            <p className="mt-1 font-mono text-lg font-black text-red-600">₦{money(report.totalCredit)}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Voucher</TableHead>
                <TableHead>Particulars</TableHead>
                <TableHead>Narration</TableHead>
                <TableHead className="text-right">Money In</TableHead>
                <TableHead className="text-right">Money Out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-slate-500">No transactions found.</TableCell>
                </TableRow>
              ) : report.rows.map(row => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-slate-700 dark:text-slate-300">{formatDate(row.date)}</TableCell>
                  <TableCell>
                    <Link href={`/accounting/vouchers/${row.voucherType.toLowerCase()}/${row.voucherId}`} className="font-bold text-indigo-700 hover:underline dark:text-indigo-300">
                      {row.voucherNo}
                    </Link>
                    <span className="ml-2 text-xs font-semibold text-slate-400">{row.voucherType}</span>
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate text-slate-700 dark:text-slate-300">{row.particulars}</TableCell>
                  <TableCell className="max-w-[320px] truncate text-slate-500">{row.narration || "-"}</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-emerald-600">{money(row.debit)}</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-red-600">{money(row.credit)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-slate-50 font-black dark:bg-slate-950">
                <TableCell colSpan={4} className="text-right">Total</TableCell>
                <TableCell className="text-right font-mono text-emerald-600">{money(report.totalDebit)}</TableCell>
                <TableCell className="text-right font-mono text-red-600">{money(report.totalCredit)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </AccountingShell>
  )
}
