import Link from "next/link"
import { Boxes, BookOpen, Users, Landmark } from "lucide-react"
import { AccountingShell } from "@/components/accounting/accounting-shell"

const infoCards = [
  { href: "/accounting/info/group", label: "Groups", icon: Boxes },
  { href: "/accounting/info/ledger", label: "Ledgers", icon: BookOpen },
  { href: "/accounting/info/party", label: "Parties", icon: Users },
  { href: "/accounting/info/bank-account", label: "Bank Accounts", icon: Landmark },
]

export default function AccountingInfoPage() {
  return (
    <AccountingShell title="Accounts Info">
      <div className="flex flex-col gap-2">
        {infoCards.map(card => {
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
