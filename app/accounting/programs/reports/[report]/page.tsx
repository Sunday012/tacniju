import Link from "next/link"
import { notFound } from "next/navigation"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAccountingPrograms } from "@/app/accounting/actions"
import { getBillPendingRows } from "@/app/accounting/display/bill-pending/actions"
import { createClient } from "@/lib/server"
import { getAccountingOrgId } from "@/lib/accounting-org"

const reportTitles: Record<string, string> = {
  events: "Events Reports",
  attendance: "Attendance Report",
  expenses: "Expenses Report",
  income: "Income Report",
  debtors: "Debtor's Report",
  creditors: "Creditor's Report",
}

type VoucherReportRow = {
  id: string
  date: string
  voucherNo: string | null
  reference: string | null
  particular: string
  account: string
  amount: number
}

type LevyReportRow = VoucherReportRow & {
  levyName: string
  partyCount: number
}

type AttendanceRow = {
  id: string
  date: string
  service_name: string
  men_count: number | null
  women_count: number | null
  children_count: number | null
  total_count: number | null
  notes: string | null
}

function money(value: number) {
  return value ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"
}

function formatDate(dateValue: string) {
  const [year, month, day] = (dateValue || "").split("-")
  if (!year || !month || !day) return dateValue || "-"
  return `${day}/${month}/${year}`
}

function names(entries: any[], side: "debit" | "credit") {
  const field = side === "debit" ? "debit_amount" : "credit_amount"
  return Array.from(new Set(
    entries
      .filter(entry => Number(entry[field] || 0) > 0)
      .map(entry => entry.ledgers?.name || "Ledger")
  )).join(", ") || "-"
}

function attendanceTotal(row: AttendanceRow) {
  return Number(row.total_count || Number(row.men_count || 0) + Number(row.women_count || 0) + Number(row.children_count || 0))
}

async function getVoucherRows(voucherType: "Expense" | "Income") {
  const supabase = await createClient()
  const orgId = await getAccountingOrgId()
  const { data, error } = await supabase
    .from("vouchers")
    .select(`
      id,
      voucher_no,
      date,
      reference,
      voucher_entries (
        debit_amount,
        credit_amount,
        ledgers ( name )
      )
    `)
    .eq("org_id", orgId)
    .eq("voucher_type", voucherType)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error(`Error fetching ${voucherType} report:`, error)
    return []
  }

  return (data || []).map((voucher: any) => {
    const entries = voucher.voucher_entries || []
    const debitTotal = entries.reduce((sum: number, entry: any) => sum + Number(entry.debit_amount || 0), 0)
    const creditTotal = entries.reduce((sum: number, entry: any) => sum + Number(entry.credit_amount || 0), 0)
    return {
      id: voucher.id as string,
      date: voucher.date as string,
      voucherNo: (voucher.voucher_no as string | null) || null,
      reference: (voucher.reference as string | null) || null,
      particular: voucherType === "Expense" ? names(entries, "credit") : names(entries, "debit"),
      account: voucherType === "Expense" ? names(entries, "debit") : names(entries, "credit"),
      amount: Math.max(debitTotal, creditTotal),
    }
  }) as VoucherReportRow[]
}

async function getLevyRows() {
  const supabase = await createClient()
  const orgId = await getAccountingOrgId()
  const { data, error } = await supabase
    .from("vouchers")
    .select(`
      id,
      voucher_no,
      date,
      reference,
      voucher_entries (
        debit_amount,
        credit_amount,
        ledgers ( name, ledger_kind )
      )
    `)
    .eq("org_id", orgId)
    .eq("voucher_type", "Levy")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching levy report:", error)
    return []
  }

  return (data || []).map((voucher: any) => {
    const entries = voucher.voucher_entries || []
    const debitEntries = entries.filter((entry: any) => Number(entry.debit_amount || 0) > 0)
    const debitTotal = entries.reduce((sum: number, entry: any) => sum + Number(entry.debit_amount || 0), 0)
    const creditTotal = entries.reduce((sum: number, entry: any) => sum + Number(entry.credit_amount || 0), 0)
    const levyName = names(entries, "credit")

    return {
      id: voucher.id as string,
      date: voucher.date as string,
      voucherNo: (voucher.voucher_no as string | null) || null,
      reference: (voucher.reference as string | null) || null,
      particular: names(entries, "debit"),
      account: levyName,
      levyName,
      partyCount: debitEntries.length,
      amount: Math.max(debitTotal, creditTotal),
    }
  }) as LevyReportRow[]
}

async function getAttendanceRows() {
  const supabase = await createClient()
  const orgId = await getAccountingOrgId()
  const { data, error } = await supabase
    .from("attendance")
    .select("id, date, service_name, men_count, women_count, children_count, total_count, notes")
    .eq("org_id", orgId)
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching attendance report:", error)
    return []
  }

  return (data || []) as AttendanceRow[]
}

function sumByReference(rows: { reference: string | null; amount: number }[], reference: string) {
  return rows
    .filter(row => row.reference === reference)
    .reduce((sum, row) => sum + row.amount, 0)
}

function getEventAttendanceTotal(attendanceRows: AttendanceRow[], eventName: string) {
  const normalizedEvent = eventName.trim().toLowerCase()
  return attendanceRows
    .filter(row => row.service_name?.trim().toLowerCase() === normalizedEvent)
    .reduce((sum, row) => sum + attendanceTotal(row), 0)
}

function getLevyNames(levyRows: LevyReportRow[], reference: string) {
  return Array.from(new Set(
    levyRows
      .filter(row => row.reference === reference)
      .map(row => row.levyName)
      .filter(Boolean)
  )).join(", ") || "-"
}

function getEvent(programs: { id: string; name: string }[], reference: string | null) {
  return programs.find(program => program.id === reference) || null
}

function getAttendanceEvent(programs: { id: string; name: string }[], row: AttendanceRow) {
  const serviceName = row.service_name?.trim().toLowerCase()
  if (!serviceName) return null
  return programs.find(program => program.name.trim().toLowerCase() === serviceName) || null
}

async function getOutstandingRows(kind: "debtors" | "creditors") {
  const sourceRows = kind === "debtors"
    ? await Promise.all([getBillPendingRows("sales"), getBillPendingRows("income")])
    : await Promise.all([getBillPendingRows("purchase"), getBillPendingRows("expense")])

  return Array.from(sourceRows.flat().reduce((map, row) => {
    const key = `${row.reference || "general"}:${row.partyId || row.party}`
    const current = map.get(key) || { party: row.party, partyId: row.partyId, reference: row.reference, vouchers: 0, amount: 0 }
    current.vouchers += 1
    current.amount += row.pendingValue
    map.set(key, current)
    return map
  }, new Map<string, { party: string; partyId: string | null; reference: string | null; vouchers: number; amount: number }>()).values())
    .sort((a, b) => b.amount - a.amount || a.party.localeCompare(b.party))
}

function ReportFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <AccountingShell title={title} backHref="/accounting/programs/reports" backLabel="Reports">
      {children}
    </AccountingShell>
  )
}

export function generateStaticParams() {
  return Object.keys(reportTitles).map(report => ({ report }))
}

export default async function ProgramReportPage({ params }: { params: { report: string } }) {
  const title = reportTitles[params.report]
  if (!title) notFound()

  if (params.report === "events") {
    const [programs, levyRows, attendanceRows, expenseRows, incomeRows, debtorRows, creditorRows] = await Promise.all([
      getAccountingPrograms(),
      getLevyRows(),
      getAttendanceRows(),
      getVoucherRows("Expense"),
      getVoucherRows("Income"),
      getOutstandingRows("debtors"),
      getOutstandingRows("creditors"),
    ])
    const programIds = new Set(programs.map(program => program.id))
    const eventLevyRows = levyRows.filter(row => row.reference && programIds.has(row.reference))
    const eventAttendanceRows = attendanceRows.filter(row => getAttendanceEvent(programs, row))
    const eventExpenseRows = expenseRows.filter(row => row.reference && programIds.has(row.reference))
    const eventIncomeRows = incomeRows.filter(row => row.reference && programIds.has(row.reference))
    const eventDebtorRows = debtorRows.filter(row => row.reference && programIds.has(row.reference))
    const eventCreditorRows = creditorRows.filter(row => row.reference && programIds.has(row.reference))
    const totalBudget = programs.reduce((sum, program) => sum + Number(program.amount_to_contribute || 0), 0)
    const totalLevies = eventLevyRows.reduce((sum, row) => sum + row.amount, 0)
    const totalAttendance = eventAttendanceRows.reduce((sum, row) => sum + attendanceTotal(row), 0)
    const totalIncome = eventIncomeRows.reduce((sum, row) => sum + row.amount, 0)
    const totalExpenses = eventExpenseRows.reduce((sum, row) => sum + row.amount, 0)
    const totalDebtors = eventDebtorRows.reduce((sum, row) => sum + row.amount, 0)
    const totalCreditors = eventCreditorRows.reduce((sum, row) => sum + row.amount, 0)

    return (
      <ReportFrame title={title}>
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {[
              ["Events", programs.length.toLocaleString()],
              ["Total People", totalAttendance.toLocaleString()],
              ["Levies", money(totalLevies)],
              ["Income", money(totalIncome)],
              ["Expenses", money(totalExpenses)],
              ["Outstanding", money(totalDebtors - totalCreditors)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">{label}</p>
                <p className="mt-1 text-lg font-black text-slate-900">{value}</p>
              </div>
            ))}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Name of Levy</TableHead>
                <TableHead className="text-right">Total People</TableHead>
                <TableHead className="text-right">Budget</TableHead>
                <TableHead className="text-right">Levy Total</TableHead>
                <TableHead className="text-right">Income</TableHead>
                <TableHead className="text-right">Expenses</TableHead>
                <TableHead className="text-right">Debtors</TableHead>
                <TableHead className="text-right">Creditors</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="py-8 text-center text-slate-500">No event budgets found.</TableCell></TableRow>
              ) : programs.map(program => {
                const budget = Number(program.amount_to_contribute || 0)
                const eventLevies = sumByReference(eventLevyRows, program.id)
                const eventIncome = sumByReference(eventIncomeRows, program.id)
                const eventExpenses = sumByReference(eventExpenseRows, program.id)
                const eventDebtors = eventDebtorRows.filter(row => row.reference === program.id).reduce((sum, row) => sum + row.amount, 0)
                const eventCreditors = eventCreditorRows.filter(row => row.reference === program.id).reduce((sum, row) => sum + row.amount, 0)
                return (
                  <TableRow key={program.id} className="hover:bg-slate-50">
                    <TableCell className="font-bold">
                      <Link href={`/accounting/programs/events/${program.id}`} className="block hover:text-indigo-700">{program.name}</Link>
                    </TableCell>
                    <TableCell className="max-w-xs text-slate-600">{getLevyNames(levyRows, program.id)}</TableCell>
                    <TableCell className="text-right font-mono">{getEventAttendanceTotal(attendanceRows, program.name).toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{money(budget)}</TableCell>
                    <TableCell className="text-right font-mono">{money(eventLevies)}</TableCell>
                    <TableCell className="text-right font-mono">{money(eventIncome)}</TableCell>
                    <TableCell className="text-right font-mono">{money(eventExpenses)}</TableCell>
                    <TableCell className="text-right font-mono">{money(eventDebtors)}</TableCell>
                    <TableCell className="text-right font-mono">{money(eventCreditors)}</TableCell>
                  </TableRow>
                )
              })}
              <TableRow className="bg-slate-50">
                <TableCell colSpan={2} className="text-right font-black">Total</TableCell>
                <TableCell className="text-right font-mono font-black">{totalAttendance.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono font-black">{money(totalBudget)}</TableCell>
                <TableCell className="text-right font-mono font-black">{money(totalLevies)}</TableCell>
                <TableCell className="text-right font-mono font-black">{money(totalIncome)}</TableCell>
                <TableCell className="text-right font-mono font-black">{money(totalExpenses)}</TableCell>
                <TableCell className="text-right font-mono font-black">{money(totalDebtors)}</TableCell>
                <TableCell className="text-right font-mono font-black">{money(totalCreditors)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name of Levy</TableHead>
                <TableHead>Event the Levy is For</TableHead>
                <TableHead className="text-right">People Billed</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventLevyRows.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="py-8 text-center text-slate-500">No levy records found.</TableCell></TableRow>
              ) : eventLevyRows.map(row => {
                const event = programs.find(program => program.id === row.reference)
                return (
                  <TableRow key={row.id} className="hover:bg-slate-50">
                    <TableCell className="font-bold">
                      <Link href={`/accounting/vouchers/levy?edit=${row.id}`} className="block hover:text-indigo-700">{row.levyName}</Link>
                    </TableCell>
                    <TableCell>{event ? (
                      <Link href={`/accounting/programs/events/${event.id}`} className="font-semibold hover:text-indigo-700">{event.name}</Link>
                    ) : "-"}</TableCell>
                    <TableCell className="text-right font-mono">{row.partyCount.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono font-bold">{money(row.amount)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </ReportFrame>
    )
  }

  if (params.report === "attendance") {
    const [programs, rows] = await Promise.all([getAccountingPrograms(), getAttendanceRows()])
    const eventRows = rows
      .map(row => ({ ...row, event: getAttendanceEvent(programs, row) }))
      .filter(row => row.event)
    const totals = eventRows.reduce((sum, row) => ({
      men: sum.men + Number(row.men_count || 0),
      women: sum.women + Number(row.women_count || 0),
      children: sum.children + Number(row.children_count || 0),
      total: sum.total + attendanceTotal(row),
    }), { men: 0, women: 0, children: 0, total: 0 })

    return (
      <ReportFrame title={title}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Service / Event</TableHead>
              <TableHead className="text-right">Men</TableHead>
              <TableHead className="text-right">Women</TableHead>
              <TableHead className="text-right">Children</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventRows.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="py-8 text-center text-slate-500">No event-linked attendance records found.</TableCell></TableRow>
            ) : eventRows.map(row => (
              <TableRow key={row.id}>
                <TableCell className="font-bold">
                  <Link href={`/accounting/programs/events/${row.event!.id}`} className="block hover:text-indigo-700">{row.event!.name}</Link>
                </TableCell>
                <TableCell className="whitespace-nowrap text-slate-600">{formatDate(row.date)}</TableCell>
                <TableCell className="font-bold">{row.service_name}</TableCell>
                <TableCell className="text-right font-mono">{Number(row.men_count || 0).toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono">{Number(row.women_count || 0).toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono">{Number(row.children_count || 0).toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono font-bold">{attendanceTotal(row).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-slate-50">
              <TableCell colSpan={3} className="text-right font-black">Total</TableCell>
              <TableCell className="text-right font-mono font-black">{totals.men.toLocaleString()}</TableCell>
              <TableCell className="text-right font-mono font-black">{totals.women.toLocaleString()}</TableCell>
              <TableCell className="text-right font-mono font-black">{totals.children.toLocaleString()}</TableCell>
              <TableCell className="text-right font-mono font-black">{totals.total.toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </ReportFrame>
    )
  }

  if (params.report === "expenses" || params.report === "income") {
    const voucherType = params.report === "expenses" ? "Expense" : "Income"
    const [programs, allRows] = await Promise.all([getAccountingPrograms(), getVoucherRows(voucherType)])
    const rows = allRows.filter(row => getEvent(programs, row.reference))
    const total = rows.reduce((sum, row) => sum + row.amount, 0)

    return (
      <ReportFrame title={title}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Voucher No.</TableHead>
              <TableHead>Particulars</TableHead>
              <TableHead>{voucherType === "Expense" ? "Expense Ledger" : "Income Ledger"}</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-8 text-center text-slate-500">No event-linked {params.report} records found.</TableCell></TableRow>
            ) : rows.map(row => {
              const event = getEvent(programs, row.reference)
              return (
                <TableRow key={row.id} className="hover:bg-slate-50">
                  <TableCell className="font-bold">
                    {event ? (
                      <Link href={`/accounting/programs/events/${event.id}`} className="block hover:text-indigo-700">{event.name}</Link>
                    ) : "-"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-slate-600">{formatDate(row.date)}</TableCell>
                  <TableCell className="font-black">
                    <Link href={`/accounting/vouchers/${voucherType.toLowerCase()}?edit=${row.id}`} className="hover:text-indigo-700">
                      {row.voucherNo || "Open voucher"}
                    </Link>
                  </TableCell>
                  <TableCell className="font-semibold">{row.particular}</TableCell>
                  <TableCell className="text-slate-600">{row.account}</TableCell>
                  <TableCell className="text-right font-mono font-bold">{money(row.amount)}</TableCell>
                </TableRow>
              )
            })}
            <TableRow className="bg-slate-50">
              <TableCell colSpan={5} className="text-right font-black">Total</TableCell>
              <TableCell className="text-right font-mono font-black">{money(total)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </ReportFrame>
    )
  }

  const [programs, allRows] = await Promise.all([
    getAccountingPrograms(),
    getOutstandingRows(params.report as "debtors" | "creditors"),
  ])
  const rows = allRows.filter(row => getEvent(programs, row.reference))
  const total = rows.reduce((sum, row) => sum + row.amount, 0)

  return (
    <ReportFrame title={title}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Party</TableHead>
            <TableHead className="text-right">Open Vouchers</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow><TableCell colSpan={4} className="py-8 text-center text-slate-500">No event-linked records found.</TableCell></TableRow>
          ) : rows.map(row => {
            const event = getEvent(programs, row.reference)
            return (
              <TableRow key={`${row.reference}:${row.partyId || row.party}`} className="hover:bg-slate-50">
                <TableCell className="font-bold">
                  {event ? (
                    <Link href={`/accounting/programs/events/${event.id}`} className="block hover:text-indigo-700">{event.name}</Link>
                  ) : "-"}
                </TableCell>
                <TableCell className="font-bold">
                  {row.partyId ? (
                    <Link href={`/accounting/info/party/${row.partyId}`} className="block hover:text-indigo-700">{row.party}</Link>
                  ) : row.party}
                </TableCell>
                <TableCell className="text-right font-mono">{row.vouchers.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono font-bold">{money(row.amount)}</TableCell>
              </TableRow>
            )
          })}
          <TableRow className="bg-slate-50">
            <TableCell colSpan={3} className="text-right font-black">Total</TableCell>
            <TableCell className="text-right font-mono font-black">{money(total)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </ReportFrame>
  )
}
