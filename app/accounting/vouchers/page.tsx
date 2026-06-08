import Link from "next/link"
import { ReceiptText, WalletCards } from "lucide-react"
import { AccountingShell } from "@/components/accounting/accounting-shell"

const voucherCards = [
  { href: "/accounting/vouchers/receipt", label: "Receipt", icon: ReceiptText },
  { href: "/accounting/vouchers/payment", label: "Payment", icon: WalletCards },
  { href: "/accounting/vouchers/contra", label: "Contra", icon: WalletCards },
  { href: "/accounting/vouchers/expense", label: "Expenses", icon: WalletCards },
]

export default function AccountingVouchersPage() {
  return (
    <AccountingShell title="Accounting Vouchers">
      <div className="flex flex-col gap-2">
        {voucherCards.map(card => {
          const Icon = card.icon
          return (
            <Link
              key={card.href}
              href={card.href}
              className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600">
                <Icon className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-800 sm:text-base">{card.label}</h2>
            </Link>
          )
        })}
      </div>
    </AccountingShell>
  )
}
