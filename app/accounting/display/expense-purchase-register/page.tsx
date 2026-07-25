import { AccountingShell } from "@/components/accounting/accounting-shell"
import { createClient } from "@/lib/server"
import { VoucherRegisterTable, type RegisterRow } from "@/components/accounting/voucher-register-table"
import { getAccountingOrgId } from "@/lib/accounting-org"

type VoucherEntryRow = {
  ledger_id: string
  debit_amount: number | string | null
  credit_amount: number | string | null
  ledgers?: { name?: string | null } | null
}

type ExpensePurchaseVoucher = {
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

function getEntrySummary(voucher: ExpensePurchaseVoucher) {
  const entries = voucher.voucher_entries || []
  const debitEntries = entries.filter(entry => Number(entry.debit_amount || 0) > 0)
  const creditEntries = entries.filter(entry => Number(entry.credit_amount || 0) > 0)
  const amount = debitEntries.reduce((sum, entry) => sum + Number(entry.debit_amount || 0), 0)

  return {
    expenseLedgers: debitEntries.map(entryName).join(", ") || "-",
    partyLedgers: creditEntries.map(entryName).join(", ") || "-",
    amount,
  }
}

async function getOrgId() {
  return getAccountingOrgId()
}

async function getExpensePurchaseVouchers() {
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
    .eq("voucher_type", "Expense")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching expense purchase register:", error)
    return []
  }

  return (data || []) as unknown as ExpensePurchaseVoucher[]
}

export default async function ExpensePurchaseRegisterPage() {
  const vouchers = await getExpensePurchaseVouchers()

  const rows: RegisterRow[] = vouchers.map(voucher => {
    const summary = getEntrySummary(voucher)
    return {
      id: voucher.id,
      date: voucher.date,
      dateLabel: formatIsoDate(voucher.date),
      voucherNo: voucher.voucher_no,
      party: summary.partyLedgers,
      ledger: summary.expenseLedgers,
      amount: summary.amount,
      href: `/accounting/vouchers/expense?edit=${voucher.id}`,
    }
  })

  return (
    <AccountingShell
      title="Expenses Purchase Register"
      backHref="/accounting/display/account-book"
      backLabel="Account Book"
      framed={false}
    >
      <VoucherRegisterTable
        rows={rows}
        partyLabel="Party"
        ledgerLabel="Ledger"
        emptyLabel="No expenses purchase transactions yet."
        addVoucherHref="/accounting/vouchers/expense"
      />
    </AccountingShell>
  )
}
