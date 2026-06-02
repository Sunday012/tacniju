import Link from "next/link"
import { Boxes, BookOpen, Users, Landmark } from "lucide-react"
import { AccountingShell } from "@/components/accounting/accounting-shell"

const infoCards = [
  { href: "/accounting/info/group", label: "Groups", description: "Organize ledgers hierarchically", icon: Boxes, className: "bg-indigo-50 border-indigo-200 text-indigo-700" },
  { href: "/accounting/info/ledger", label: "Ledgers", description: "Account heads for postings", icon: BookOpen, className: "bg-blue-50 border-blue-200 text-blue-700" },
  { href: "/accounting/info/party", label: "Parties", description: "Customers, vendors & members", icon: Users, className: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  { href: "/accounting/info/bank-account", label: "Bank Accounts", description: "Bank & cash ledgers", icon: Landmark, className: "bg-amber-50 border-amber-200 text-amber-700" },
]

export default function AccountingInfoPage() {
  return (
    <AccountingShell title="Accounts Info">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {infoCards.map(card => {
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
