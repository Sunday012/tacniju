import { Boxes, BookOpen } from "lucide-react"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { AccountingMenuList } from "@/components/accounting/accounting-menu-list"

const chartCards = [
  { href: "/accounting/info/group", label: "Groups", icon: Boxes },
  { href: "/accounting/info/ledger", label: "Ledgers", icon: BookOpen },
]

export default function ChartOfAccountsPage() {
  return (
    <AccountingShell title="Chart of Accounts">
      <AccountingMenuList items={chartCards} />
    </AccountingShell>
  )
}
