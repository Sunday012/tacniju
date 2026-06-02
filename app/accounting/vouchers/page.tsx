import Link from "next/link"
import { ReceiptText, ShoppingCart, WalletCards } from "lucide-react"
import { AccountingShell } from "@/components/accounting/accounting-shell"

const voucherCards = [
  { href: "/accounting/vouchers/receipt", label: "Receipt", description: "Money received", icon: ReceiptText, className: "bg-red-50 border-red-200 text-red-700" },
  { href: "/accounting/vouchers/payment", label: "Payment", description: "Money paid out", icon: WalletCards, className: "bg-amber-50 border-amber-200 text-amber-700" },
  { href: "/accounting/vouchers/sales", label: "Sales", description: "Stock sales", icon: ShoppingCart, className: "bg-blue-50 border-blue-200 text-blue-700" },
  { href: "/accounting/vouchers/purchase", label: "Purchase", description: "Stock purchases", icon: ShoppingCart, className: "bg-blue-50 border-blue-200 text-blue-700" },
  { href: "/accounting/vouchers/expense", label: "Expense", description: "Expense entry", icon: WalletCards, className: "bg-amber-50 border-amber-200 text-amber-700" },
  { href: "/accounting/vouchers/income", label: "Income", description: "Income entry", icon: ReceiptText, className: "bg-amber-50 border-amber-200 text-amber-700" },
  { href: "/accounting/vouchers/contra", label: "Contra", description: "Bank/cash transfer", icon: WalletCards, className: "bg-slate-50 border-slate-300 text-slate-800" },
  { href: "/accounting/programs", label: "Program", description: "Create programs", icon: ReceiptText, className: "bg-indigo-50 border-indigo-200 text-indigo-700" },
]

export default function AccountingVouchersPage() {
  return (
    <AccountingShell title="Accounting Vouchers">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {voucherCards.map(card => {
          const Icon = card.icon
          return (
            <Link
              key={card.href}
              href={card.href}
              className={`rounded-2xl border p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${card.className}`}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-current/15 bg-white/70 shadow-sm">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-black">{card.label}</h2>
              <p className="mt-2 text-sm font-semibold opacity-75">{card.description}</p>
            </Link>
          )
        })}
      </div>
    </AccountingShell>
  )
}
