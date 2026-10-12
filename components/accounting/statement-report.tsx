import Link from "next/link"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getLedgerStatement, getStatementOptions } from "@/app/accounting/statements/actions"
import { PrintButton } from "@/components/print-button"

function money(value: number) {
  return value ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"
}

function signedMoney(value: number) {
  if (!value) return "-"
  return `${value < 0 ? "-" : ""}${money(Math.abs(value))}`
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
      <div className="space-y-4 print:space-y-2">
        <div className="hidden border-b-2 border-black pb-4 print:block">
          <p className="text-sm font-black uppercase">The Apostolic Church Nigeria</p>
          <p className="text-sm font-bold uppercase">Iju Area Youth</p>
          <h1 className="mt-5 text-2xl font-black">{selectedLedger?.name || title} Statement</h1>
          <div className="mt-2 flex justify-between text-sm"><span>Report type: {title}</span><span>{searchParams?.start || "Beginning"} to {searchParams?.end || "Present"}</span></div>
        </div>
        <div className="flex justify-end print:hidden"><PrintButton label="Print / Save PDF" /></div>
        <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm print:hidden md:grid-cols-[minmax(220px,1fr)_170px_170px_auto] dark:border-slate-800 dark:bg-slate-900">
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

        <div className="grid gap-3 print:hidden sm:grid-cols-3">
          <div className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Account</p>
            <p className="mt-1 text-lg font-black text-slate-900 dark:text-slate-100">{selectedLedger?.name || "-"}</p>
          </div>
          <div className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Total Debit Amount</p>
            <p className="mt-1 font-mono text-lg font-black text-emerald-600">₦{money(report.totalDebit)}</p>
          </div>
          <div className="border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Total Credit Amount</p>
            <p className="mt-1 font-mono text-lg font-black text-red-600">₦{money(report.totalCredit)}</p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 bg-white shadow-sm print:overflow-visible print:border-black print:shadow-none dark:border-slate-800 dark:bg-slate-900">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="border-b border-slate-300">
                <TableHead colSpan={5} className="h-12 text-center text-base font-black uppercase tracking-wide text-slate-900 dark:text-slate-100">
                  {selectedLedger?.name || title} Statement Layout
                </TableHead>
              </TableRow>
              <TableRow>
                <TableHead className="w-[130px]">Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Debit Amount</TableHead>
                <TableHead className="text-right">Credit Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-slate-500">No transactions found.</TableCell>
                </TableRow>
              ) : report.rows.map(row => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-slate-700 dark:text-slate-300">{formatDate(row.date)}</TableCell>
                  <TableCell className="min-w-[280px] text-slate-700 dark:text-slate-300">
                    <div className="flex flex-col gap-1">
                      <Link href={`/accounting/vouchers/${row.voucherType.toLowerCase()}/${row.voucherId}`} className="font-bold text-indigo-700 hover:underline dark:text-indigo-300">
                        {row.particulars || row.narration || row.voucherNo}
                      </Link>
                      <span className="text-xs font-semibold text-slate-500">
                        {row.voucherNo} · {row.voucherType}{row.narration ? ` · ${row.narration}` : ""}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-emerald-600">{money(row.debit)}</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-red-600">{money(row.credit)}</TableCell>
                  <TableCell className="text-right font-mono font-black text-slate-900 dark:text-slate-100">{signedMoney(row.balance)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-slate-50 font-black dark:bg-slate-950">
                <TableCell colSpan={2} className="text-right">Total</TableCell>
                <TableCell className="text-right font-mono text-emerald-600">{money(report.totalDebit)}</TableCell>
                <TableCell className="text-right font-mono text-red-600">{money(report.totalCredit)}</TableCell>
                <TableCell className="text-right font-mono">{signedMoney(report.totalDebit - report.totalCredit)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </AccountingShell>
  )
}
