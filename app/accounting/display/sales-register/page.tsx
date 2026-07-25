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

type SalesVoucher = {
  id: string
  voucher_no: string
  date: string
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

function getEntrySummary(voucher: SalesVoucher) {
  const entries = voucher.voucher_entries || []
  const debitEntries = entries.filter(entry => Number(entry.debit_amount || 0) > 0)
  const creditEntries = entries.filter(entry => Number(entry.credit_amount || 0) > 0)
  const debitTotal = debitEntries.reduce((sum, entry) => sum + Number(entry.debit_amount || 0), 0)
  const creditTotal = creditEntries.reduce((sum, entry) => sum + Number(entry.credit_amount || 0), 0)

  return {
    // Sales debit the customer/party and credit the sales ledger.
    party: debitEntries.map(entryName).join(", ") || "-",
    salesLedgers: creditEntries.map(entryName).join(", ") || "-",
    amount: Math.max(debitTotal, creditTotal),
  }
}

async function getOrgId() {
  return getAccountingOrgId()
}

async function getSalesVouchers() {
  const supabase = await createClient()
  const orgId = await getOrgId()

  const { data, error } = await supabase
    .from("vouchers")
    .select(`
      id,
      voucher_no,
      date,
      voucher_entries (
        ledger_id,
        debit_amount,
        credit_amount,
        ledgers ( name )
      )
    `)
    .eq("org_id", orgId)
    .eq("voucher_type", "Sales")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching sales register:", error)
    return []
  }

  return (data || []) as unknown as SalesVoucher[]
}

export default async function SalesRegisterPage() {
  const vouchers = await getSalesVouchers()

  const rows: RegisterRow[] = vouchers.map(voucher => {
    const summary = getEntrySummary(voucher)
    return {
      id: voucher.id,
      date: voucher.date,
      dateLabel: formatIsoDate(voucher.date),
      voucherNo: voucher.voucher_no,
      party: summary.party,
      ledger: summary.salesLedgers,
      amount: summary.amount,
      href: `/accounting/vouchers/sales?edit=${voucher.id}`,
    }
  })

  return (
    <AccountingShell
      title="Sales Register"
      backHref="/accounting/display/account-book"
      backLabel="Account Book"
      framed={false}
    >
      <VoucherRegisterTable
        rows={rows}
        partyLabel="Party"
        ledgerLabel="Sales Ledger"
        emptyLabel="No sales transactions yet."
        addVoucherHref="/accounting/vouchers/sales"
      />
    </AccountingShell>
  )
}
