import Link from "next/link"
import { ReceiptText, ShoppingCart, WalletCards } from "lucide-react"
import { AccountingShell } from "@/components/accounting/accounting-shell"

const voucherCards = [
  { href: "/accounting/vouchers/receipt", label: "Receipt", icon: ReceiptText },
  { href: "/accounting/vouchers/payment", label: "Payment", icon: WalletCards },
  { href: "/accounting/vouchers/sales", label: "Sales", icon: ShoppingCart },
  { href: "/accounting/vouchers/purchase", label: "Purchase", icon: ShoppingCart },
  { href: "/accounting/vouchers/expense", label: "Expense", icon: WalletCards },
  { href: "/accounting/vouchers/income", label: "Income", icon: ReceiptText },
  { href: "/accounting/vouchers/contra", label: "Contra", icon: WalletCards },
  { href: "/accounting/programs", label: "Program", icon: ReceiptText },
]

export default function AccountingVouchersPage() {
  return (
    <AccountingShell title="Accounting Vouchers">
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {voucherCards.map(card => {
          const Icon = card.icon
          return (
            <Link
              key={card.href}
              href={card.href}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-base font-bold text-slate-800">{card.label}</h2>
            </Link>
          )
        })}
      </div>
    </AccountingShell>
  )
}
