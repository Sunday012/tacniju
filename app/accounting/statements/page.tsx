import Link from "next/link"
import { Banknote, Landmark, Users } from "lucide-react"
import { AccountingShell } from "@/components/accounting/accounting-shell"

const statementCards = [
  { href: "/accounting/statements/party", label: "Party Statement", icon: Users },
  { href: "/accounting/statements/bank", label: "Bank Statement", icon: Landmark },
  { href: "/accounting/statements/cash-in-hand", label: "Cash in Hand Statement", icon: Banknote },
]

export default function StatementsPage() {
  return (
    <AccountingShell title="Statements">
      <div className="flex flex-col gap-3 sm:gap-4">
        {statementCards.map(card => {
          const Icon = card.icon
          return (
            <Link
              key={card.href}
              href={card.href}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md sm:gap-4 sm:p-5 lg:p-6"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 sm:h-12 sm:w-12">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h2 className="text-base font-bold text-slate-800 sm:text-lg lg:text-xl">{card.label}</h2>
            </Link>
          )
        })}
      </div>
    </AccountingShell>
  )
}
