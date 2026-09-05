import Link from "next/link"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { getVoucherStatistics } from "@/app/vouchers/actions"

function money(value: number) {
  return value ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"
}

const voucherLinks: Record<string, string> = {
  Receipt: "/accounting/display/receipt-register",
  Payment: "/accounting/display/payment-register",
  Purchase: "/accounting/display/purchase-register",
  Sales: "/accounting/display/sales-register",
  Expense: "/accounting/display/expense-purchase-register",
  Income: "/accounting/display/income-register",
  Contra: "/accounting/vouchers/contra",
  Levy: "/accounting/vouchers/levy",
}

export default async function VoucherStatisticsPage() {
  const rows = await getVoucherStatistics()

  return (
    <AccountingShell title="Voucher Statistics" backHref="/accounting/display/statement-of-accounts" backLabel="Statement of Accounts">
      <div className="divide-y rounded-xl border bg-white">
        {rows.map(row => (
          <Link key={row.voucher_type} href={voucherLinks[row.voucher_type] || `/accounting/vouchers/${row.voucher_type.toLowerCase()}`} className="grid grid-cols-[1fr_140px_180px] px-4 py-3 text-sm transition hover:bg-slate-50 hover:text-indigo-700">
            <div className="font-black">{row.voucher_type}</div>
            <div className="text-right font-mono">{row.count.toLocaleString()} entries</div>
            <div className="text-right font-mono font-bold">{money(row.total)}</div>
          </Link>
        ))}
      </div>
    </AccountingShell>
  )
}
