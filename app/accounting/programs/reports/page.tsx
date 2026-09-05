import { ClipboardList, FileBarChart, Landmark, TrendingDown, TrendingUp, Users } from "lucide-react"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { AccountingMenuList } from "@/components/accounting/accounting-menu-list"

const reportItems = [
  { href: "/accounting/programs/events", label: "Events Reports", icon: ClipboardList },
  { href: "/dashboard/attendance", label: "Attendance Report", icon: Users },
  { href: "/accounting/display/expense-purchase-register", label: "Expenses Report", icon: TrendingDown },
  { href: "/accounting/display/income-register", label: "Income Report", icon: TrendingUp },
  { href: "/accounting/display/outstanding-receivable", label: "Debtor's Report", icon: FileBarChart },
  { href: "/accounting/display/outstanding-payable", label: "Creditor's Report", icon: Landmark },
]

export default function ProgramReportsPage() {
  return (
    <AccountingShell title="Reports" backHref="/accounting/programs" backLabel="Programs">
      <AccountingMenuList items={reportItems} />
    </AccountingShell>
  )
}
