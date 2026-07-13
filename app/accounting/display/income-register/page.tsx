import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { createClient } from "@/lib/server"
import { VoucherRegisterTable, type RegisterRow } from "@/components/accounting/voucher-register-table"

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

  const rows: RegisterRow[] = vouchers.map(voucher => {
    const summary = getEntrySummary(voucher)
    return {
      id: voucher.id,
      dateLabel: formatIsoDate(voucher.date),
      voucherNo: voucher.voucher_no,
      party: summary.accountLedgers,
      ledger: summary.incomeLedgers,
      amount: summary.amount,
      href: `/accounting/vouchers/income?edit=${voucher.id}`,
    }
  })

  return (
    <AccountingShell
      title="Income Register"
      backHref="/accounting/display/account-book"
      backLabel="Account Book"
      framed={false}
    >
      <VoucherRegisterTable
        rows={rows}
        partyLabel="Account"
        ledgerLabel="Income Ledger"
        emptyLabel="No income transactions yet."
      />
    </AccountingShell>
  )
}
