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

type PurchaseVoucher = {
  id: string
  voucher_no: string
  date: string
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

function getEntrySummary(voucher: PurchaseVoucher) {
  const entries = voucher.voucher_entries || []
  const debitEntries = entries.filter(entry => Number(entry.debit_amount || 0) > 0)
  const creditEntries = entries.filter(entry => Number(entry.credit_amount || 0) > 0)
  const debitTotal = debitEntries.reduce((sum, entry) => sum + Number(entry.debit_amount || 0), 0)
  const creditTotal = creditEntries.reduce((sum, entry) => sum + Number(entry.credit_amount || 0), 0)

  return {
    // Purchases debit the purchase ledger and credit the supplier/party.
    party: creditEntries.map(entryName).join(", ") || "-",
    purchaseLedgers: debitEntries.map(entryName).join(", ") || "-",
    amount: Math.max(debitTotal, creditTotal),
  }
}

async function getOrgId() {
  return getAccountingOrgId()
}

async function getPurchaseVouchers() {
  const supabase = await createClient()
  const orgId = await getOrgId()

  const { data, error } = await supabase
    .from("vouchers")
    .select(`
      id,
      voucher_no,
      date,
      narration,
      voucher_entries (
        ledger_id,
        debit_amount,
        credit_amount,
        ledgers ( name )
      )
    `)
    .eq("org_id", orgId)
    .eq("voucher_type", "Purchase")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching purchase register:", error)
    return []
  }

  // Exclude batch/stock/raw-material journals; they have their own production registers.
  return (data || []).filter((voucher: any) => {
    const voucherNo = String(voucher.voucher_no || "")
    const narration = String(voucher.narration || "")
    return !(narration === "Batch" || narration === "Production" || narration === "Raw Material" || voucherNo.startsWith("BAT-") || voucherNo.startsWith("STJ-") || voucherNo.startsWith("RMJ-"))
  }) as unknown as PurchaseVoucher[]
}

export default async function PurchaseRegisterPage() {
  const vouchers = await getPurchaseVouchers()

  const rows: RegisterRow[] = vouchers.map(voucher => {
    const summary = getEntrySummary(voucher)
    return {
      id: voucher.id,
      date: voucher.date,
      dateLabel: formatIsoDate(voucher.date),
      voucherNo: voucher.voucher_no,
      party: summary.party,
      ledger: summary.purchaseLedgers,
      amount: summary.amount,
      href: `/accounting/vouchers/purchase?edit=${voucher.id}`,
    }
  })

  return (
    <AccountingShell
      title="Purchase Register"
      backHref="/accounting/display/account-book"
      backLabel="Account Book"
      framed={false}
    >
      <VoucherRegisterTable
        rows={rows}
        partyLabel="Party"
        ledgerLabel="Purchase Ledger"
        emptyLabel="No purchase transactions yet."
        addVoucherHref="/accounting/vouchers/purchase"
      />
    </AccountingShell>
  )
}
