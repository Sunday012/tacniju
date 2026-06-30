import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Eye } from "lucide-react"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { createClient } from "@/lib/server"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type VoucherEntryRow = {
  ledger_id: string
  debit_amount: number | string | null
  credit_amount: number | string | null
  ledgers?: { name?: string | null } | null
}

type IncomeVoucher = {
  id: string
  voucher_no: string
  date: string
  reference: string | null
  narration: string | null
  voucher_entries?: VoucherEntryRow[] | null
}

function formatIsoDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-")
  if (!year || !month || !day) return dateValue
  return `${day}/${month}/${year}`
}

function money(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function entryName(entry: VoucherEntryRow) {
  return entry.ledgers?.name || "Ledger"
}

function getEntrySummary(voucher: IncomeVoucher) {
  const entries = voucher.voucher_entries || []
  const debitEntries = entries.filter(entry => Number(entry.debit_amount || 0) > 0)
  const creditEntries = entries.filter(entry => Number(entry.credit_amount || 0) > 0)
  const amount = creditEntries.reduce((sum, entry) => sum + Number(entry.credit_amount || 0), 0)

  return {
    accountLedgers: debitEntries.map(entryName).join(", ") || "-",
    incomeLedgers: creditEntries.map(entryName).join(", ") || "-",
    amount,
  }
}

async function getOrgId() {
  const supabase = await createClient()
  const cookieStore = cookies()
  const orgId = cookieStore.get("active_org_id")?.value
  if (!orgId) redirect("/select-church")

  const { data: org, error } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", orgId)
    .maybeSingle()

  if (error || !org?.id) redirect("/select-church")
  return orgId
}

async function getIncomeVouchers() {
  const supabase = await createClient()
  const orgId = await getOrgId()

  const { data, error } = await supabase
    .from("vouchers")
    .select(`
      id,
      voucher_no,
      date,
      reference,
      narration,
      voucher_entries (
        ledger_id,
        debit_amount,
        credit_amount,
        ledgers ( name )
      )
    `)
    .eq("org_id", orgId)
    .eq("voucher_type", "Income")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching income register:", error)
    return []
  }

  return (data || []) as unknown as IncomeVoucher[]
}

export default async function IncomeRegisterPage() {
  const vouchers = await getIncomeVouchers()

  return (
    <AccountingShell
      title="Income Register"
      backHref="/accounting/display/account-book"
      backLabel="Account Book"
      framed={false}
    >
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <h2 className="text-base font-black text-slate-900">Income Register</h2>
            <p className="text-sm font-semibold text-slate-500">{vouchers.length} transaction{vouchers.length === 1 ? "" : "s"}</p>
          </div>
        </div>

        {vouchers.length > 0 ? (
          <Table>
            <TableHeader className="bg-white [&_th]:h-10 [&_th]:px-4 [&_th]:text-[11px] [&_th]:font-black [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-500">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Voucher No.</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Income Ledger</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Narration</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-16 text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_td]:px-4 [&_td]:py-3">
              {vouchers.map(voucher => {
                const summary = getEntrySummary(voucher)
                return (
                  <TableRow key={voucher.id} className="hover:bg-slate-50">
                    <TableCell className="whitespace-nowrap font-semibold text-slate-700">{formatIsoDate(voucher.date)}</TableCell>
                    <TableCell className="whitespace-nowrap font-black text-slate-900">{voucher.voucher_no}</TableCell>
                    <TableCell className="min-w-44 font-semibold text-slate-700">{summary.accountLedgers}</TableCell>
                    <TableCell className="min-w-44 text-slate-700">{summary.incomeLedgers}</TableCell>
                    <TableCell className="text-slate-600">{voucher.reference || "-"}</TableCell>
                    <TableCell className="min-w-52 text-slate-600">{voucher.narration || "-"}</TableCell>
                    <TableCell className="whitespace-nowrap text-right font-black text-slate-900">₦{money(summary.amount)}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/accounting/vouchers/income/${voucher.id}?from=income-register`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                        title="View voucher"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
            No income transactions yet.
          </div>
        )}
      </div>
    </AccountingShell>
  )
}
