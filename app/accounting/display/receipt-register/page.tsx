import { AccountingShell } from "@/components/accounting/accounting-shell"
import { createClient } from "@/lib/server"
import { VoucherRegisterTable, type RegisterRow } from "@/components/accounting/voucher-register-table"
import { getAccountingOrgId } from "@/lib/accounting-org"

type VoucherEntryRow = {
  ledger_id: string
  debit_amount: number | string | null
  credit_amount: number | string | null
  ledgers?: { name?: string | null; is_cash_bank?: boolean | null } | null
}

type CashVoucher = {
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

function uniqueNames(names: string[]) {
  return Array.from(new Set(names.filter(Boolean)))
}

function getEntrySummary(voucher: CashVoucher) {
  const entries = voucher.voucher_entries || []
  const bankNames: string[] = []
  const partyNames: string[] = []
  let debitTotal = 0
  let creditTotal = 0

  for (const entry of entries) {
    const name = entry.ledgers?.name || "Ledger"
    debitTotal += Number(entry.debit_amount || 0)
    creditTotal += Number(entry.credit_amount || 0)
    if (entry.ledgers?.is_cash_bank) {
      bankNames.push(name)
    } else {
      partyNames.push(name)
    }
  }

  return {
    account: uniqueNames(bankNames).join(", ") || "-",
    party: uniqueNames(partyNames).join(", ") || "-",
    amount: Math.max(debitTotal, creditTotal),
  }
}

async function getOrgId() {
  return getAccountingOrgId()
}

async function getReceiptVouchers() {
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
        ledgers ( name, is_cash_bank )
      )
    `)
    .eq("org_id", orgId)
    .eq("voucher_type", "Receipt")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching receipt register:", error)
    return []
  }

  return (data || []) as unknown as CashVoucher[]
}

export default async function ReceiptRegisterPage() {
  const vouchers = await getReceiptVouchers()

  const rows: RegisterRow[] = vouchers.map(voucher => {
    const summary = getEntrySummary(voucher)
    return {
      id: voucher.id,
      date: voucher.date,
      dateLabel: formatIsoDate(voucher.date),
      voucherNo: voucher.voucher_no,
      party: summary.party,
      ledger: summary.account,
      amount: summary.amount,
      href: `/accounting/vouchers/receipt?edit=${voucher.id}`,
    }
  })

  return (
    <AccountingShell
      title="Receipt Register"
      backHref="/accounting/display/account-book"
      backLabel="Account Book"
      framed={false}
    >
      <VoucherRegisterTable
        rows={rows}
        partyLabel="Particulars"
        ledgerLabel="Received Into"
        emptyLabel="No receipt transactions yet."
        addVoucherHref="/accounting/vouchers/receipt"
      />
    </AccountingShell>
  )
}
