import { Banknote, BookOpen, Landmark, Users } from "lucide-react"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { AccountingMenuList } from "@/components/accounting/accounting-menu-list"

const statementCards = [
  { href: "/accounting/statements/party", label: "Party Statement", icon: Users },
  { href: "/accounting/statements/ledger", label: "Ledger Statement", icon: BookOpen },
  { href: "/accounting/statements/bank", label: "Bank Statement", icon: Landmark },
  { href: "/accounting/statements/cash-in-hand", label: "Cash in Hand Statement", icon: Banknote },
]

export default function StatementsPage() {
  return (
    <AccountingShell title="Statements">
      <AccountingMenuList items={statementCards} />
    </AccountingShell>
  )
}
