import { ClipboardList, FileBarChart, Landmark, TrendingDown, TrendingUp, Users } from "lucide-react"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { AccountingMenuList } from "@/components/accounting/accounting-menu-list"

const reportItems = [
  { href: "/accounting/programs/reports/events", label: "Events Reports", icon: ClipboardList },
  { href: "/accounting/programs/reports/attendance", label: "Attendance Report", icon: Users },
  { href: "/accounting/programs/reports/expenses", label: "Expenses Report", icon: TrendingDown },
  { href: "/accounting/programs/reports/income", label: "Income Report", icon: TrendingUp },
  { href: "/accounting/programs/reports/debtors", label: "Debtor's Report", icon: FileBarChart },
  { href: "/accounting/programs/reports/creditors", label: "Creditor's Report", icon: Landmark },
]

export default function ProgramReportsPage() {
  return (
    <AccountingShell title="Reports" backHref="/accounting/programs" backLabel="Programs">
      <AccountingMenuList items={reportItems} />
    </AccountingShell>
  )
}
