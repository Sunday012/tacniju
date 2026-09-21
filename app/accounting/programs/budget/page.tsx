import { CalendarDays, LayoutList, ReceiptText } from "lucide-react"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { AccountingMenuList } from "@/components/accounting/accounting-menu-list"

const budgetItems = [
  { href: "/accounting/programs/budget/monthly", label: "Monthly Budget", icon: CalendarDays },
  { href: "/accounting/programs/budget/list", label: "List Budget", icon: LayoutList },
  { href: "/accounting/programs/budget/box", label: "Box Budget", icon: ReceiptText },
]

export default function ProgramBudgetPage() {
  return (
    <AccountingShell title="Budget" backHref="/accounting/programs" backLabel="Programs">
      <AccountingMenuList items={budgetItems} />
    </AccountingShell>
  )
}
