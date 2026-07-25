import { AccountingShell } from "@/components/accounting/accounting-shell"
import { getRecentVouchers } from "@/app/vouchers/actions"

function money(value: number) {
  return value ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"
}

export default async function VoucherStatisticsPage() {
  const vouchers = await getRecentVouchers()
  const summary = (vouchers || []).reduce((map: Map<string, { count: number; total: number }>, voucher: any) => {
    const current = map.get(voucher.voucher_type) || { count: 0, total: 0 }
    const total = (voucher.voucher_entries || []).reduce((sum: number, entry: any) => sum + Math.max(Number(entry.debit_amount || 0), Number(entry.credit_amount || 0)), 0)
    current.count += 1
    current.total += total / 2 || total
    map.set(voucher.voucher_type, current)
    return map
  }, new Map<string, { count: number; total: number }>())
  const rows = Array.from(summary.entries())

  return (
    <AccountingShell title="Voucher Statistics" backHref="/accounting/display/statement-of-accounts" backLabel="Statement of Accounts">
      <div className="divide-y rounded-xl border bg-white">
        {rows.map(([type, row]) => (
          <div key={type} className="grid grid-cols-[1fr_140px_180px] px-4 py-3 text-sm">
            <div className="font-black">{type}</div>
            <div className="text-right font-mono">{row.count.toLocaleString()} entries</div>
            <div className="text-right font-mono font-bold">{money(row.total)}</div>
          </div>
        ))}
      </div>
    </AccountingShell>
  )
}
