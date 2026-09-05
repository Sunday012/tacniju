import { BarChart3, FileBarChart } from "lucide-react"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { AccountingMenuList } from "@/components/accounting/accounting-menu-list"

const programItems = [
  { href: "/accounting/programs/budget", label: "Budget", icon: BarChart3 },
  { href: "/accounting/programs/reports", label: "Reports", icon: FileBarChart },
]

export default function AccountingProgramsPage() {
  return (
    <AccountingShell title="Programs">
      <AccountingMenuList items={programItems} />
    </AccountingShell>
  )
}
