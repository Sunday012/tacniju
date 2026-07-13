import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { createClient } from "@/lib/server"
import { VoucherRegisterTable, type RegisterRow } from "@/components/accounting/voucher-register-table"

type VoucherEntryRow = {
  ledger_id: string
  debit_amount: number | string | null
  credit_amount: number | string | null
  ledgers?: { name?: string | null; is_cash_bank?: boolean | null } | null
}

type PaymentReceiptVoucher = {
  id: string
  voucher_no: string
  date: string
  voucher_type: string
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

function getEntrySummary(voucher: PaymentReceiptVoucher) {
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

async function getPaymentReceiptVouchers() {
  const supabase = await createClient()
  const orgId = await getOrgId()

  const { data, error } = await supabase
    .from("vouchers")
    .select(`
      id,
      voucher_no,
      date,
      voucher_type,
      voucher_entries (
        ledger_id,
        debit_amount,
        credit_amount,
        ledgers ( name, is_cash_bank )
      )
    `)
    .eq("org_id", orgId)
    .in("voucher_type", ["Payment", "Receipt"])
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching payment/receipt register:", error)
    return []
  }

  return (data || []) as unknown as PaymentReceiptVoucher[]
}

export default async function PaymentReceiptRegisterPage() {
  const vouchers = await getPaymentReceiptVouchers()

  const rows: RegisterRow[] = vouchers.map(voucher => {
    const summary = getEntrySummary(voucher)
    return {
      id: voucher.id,
      dateLabel: formatIsoDate(voucher.date),
      voucherNo: voucher.voucher_no,
      type: voucher.voucher_type,
      party: summary.party,
      ledger: summary.account,
      amount: summary.amount,
      href: `/accounting/vouchers/${voucher.voucher_type.toLowerCase()}/${voucher.id}?from=payment-receipt-register`,
    }
  })

  return (
    <AccountingShell
      title="Payment / Receipt Register"
      backHref="/accounting/display/account-book"
      backLabel="Account Book"
      framed={false}
    >
      <VoucherRegisterTable
        rows={rows}
        typeLabel="Type"
        partyLabel="Particulars"
        ledgerLabel="Account"
        emptyLabel="No payment or receipt transactions yet."
      />
    </AccountingShell>
  )
}
