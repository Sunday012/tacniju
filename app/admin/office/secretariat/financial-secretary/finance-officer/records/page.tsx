import Link from "next/link"
import { ArrowLeft, CalendarDays } from "lucide-react"
import { createClient } from "@/lib/server"
import { getAccountingOrgId } from "@/lib/accounting-org"
import { Button } from "@/components/ui/button"
import { SendFinanceRecordsReportButton } from "@/components/admin/send-finance-records-report-button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const dynamic = "force-dynamic"

type SearchParams = { period?: string; date?: string }

const voucherLabels: Record<string, string> = {
  Receipt: "Receipts",
  Payment: "Payments",
  Income: "Income",
  Expense: "Expenses",
  Levy: "Levies",
  Sales: "Sales",
  Purchase: "Purchases",
  Contra: "Contra",
  Program: "Program",
}

function money(value: number) {
  return `NGN ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(date: string) {
  const [year, month, day] = date.split("-")
  return year && month && day ? `${day}/${month}/${year}` : date
}

function periodRange(searchParams: SearchParams) {
  const period = searchParams.period === "yearly" ? "yearly" : "monthly"
  const today = new Date()
  const date = searchParams.date || today.toISOString().slice(0, period === "yearly" ? 4 : 7)
  const year = Number(date.slice(0, 4)) || today.getFullYear()
  const month = Number(date.slice(5, 7)) || today.getMonth() + 1

  if (period === "yearly") {
    return { period, date, start: `${year}-01-01`, end: `${year}-12-31`, label: `${year}` }
  }

  const lastDay = new Date(year, month, 0).getDate()
  return { period, date, start: `${year}-${String(month).padStart(2, "0")}-01`, end: `${year}-${String(month).padStart(2, "0")}-${lastDay}`, label: new Date(year, month - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) }
}

export default async function FinanceOfficerRecordsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()
  const orgId = await getAccountingOrgId()
  const range = periodRange(searchParams)
  const { data: vouchers, error } = await supabase
    .from("vouchers")
    .select(`
      id,
      voucher_type,
      voucher_no,
      date,
      narration,
      voucher_entries (
        debit_amount,
        credit_amount
      )
    `)
    .eq("org_id", orgId)
    .gte("date", range.start)
    .lte("date", range.end)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })

  const rows = (vouchers || []).map((voucher: any) => {
    const entries = voucher.voucher_entries || []
    const debit = entries.reduce((sum: number, entry: any) => sum + Number(entry.debit_amount || 0), 0)
    const credit = entries.reduce((sum: number, entry: any) => sum + Number(entry.credit_amount || 0), 0)
    return { ...voucher, debit, credit, amount: Math.max(debit, credit) }
  })

  const totals = rows.reduce((map, row) => {
    const current = map.get(row.voucher_type) || { count: 0, amount: 0 }
    current.count += 1
    current.amount += row.amount
    map.set(row.voucher_type, current)
    return map
  }, new Map<string, { count: number; amount: number }>())

  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10">
      <div className="w-full">
        <Link href="/admin/office/secretariat/financial-secretary/finance-officer" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Finance Officer
        </Link>

        <header className="mt-8 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Finance Officer</p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Records</h1>
            <p className="mt-2 text-slate-500">All finance activity for {range.label}.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/admin/office/secretariat/financial-secretary/finance-officer/records?period=monthly&date=${new Date().toISOString().slice(0, 7)}`}>
              <Button variant={range.period === "monthly" ? "default" : "outline"} className={range.period === "monthly" ? "bg-indigo-600 font-bold" : "font-bold"}><CalendarDays className="mr-2 h-4 w-4" />Monthly</Button>
            </Link>
            <Link href={`/admin/office/secretariat/financial-secretary/finance-officer/records?period=yearly&date=${new Date().getFullYear()}`}>
              <Button variant={range.period === "yearly" ? "default" : "outline"} className={range.period === "yearly" ? "bg-indigo-600 font-bold" : "font-bold"}><CalendarDays className="mr-2 h-4 w-4" />Yearly</Button>
            </Link>
            <SendFinanceRecordsReportButton period={range.period} date={range.date} label={range.label} />
          </div>
        </header>

        {error ? (
          <div className="mt-6 border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">{error.message}</div>
        ) : (
          <>
            <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(voucherLabels).map(([type, label]) => {
                const total = totals.get(type) || { count: 0, amount: 0 }
                return (
                  <div key={type} className="border border-slate-200 bg-white p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">{total.count.toLocaleString()}</p>
                    <p className="mt-1 font-mono text-sm font-bold text-slate-600">{money(total.amount)}</p>
                  </div>
                )
              })}
            </section>

            <section className="mt-6 overflow-x-auto border border-slate-200 bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Voucher</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Narration</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap text-slate-600">{formatDate(row.date)}</TableCell>
                      <TableCell className="font-mono font-bold">{row.voucher_no || "-"}</TableCell>
                      <TableCell className="font-bold">{voucherLabels[row.voucher_type] || row.voucher_type}</TableCell>
                      <TableCell className="max-w-lg text-slate-600">{row.narration || "-"}</TableCell>
                      <TableCell className="text-right font-mono">{money(row.debit)}</TableCell>
                      <TableCell className="text-right font-mono">{money(row.credit)}</TableCell>
                    </TableRow>
                  ))}
                  {!rows.length && <TableRow><TableCell colSpan={6} className="py-12 text-center text-slate-400">No finance activity for this period.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
