import { CalendarDays, ReceiptText } from "lucide-react"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { AccountingMenuList } from "@/components/accounting/accounting-menu-list"

const budgetItems = [
  { href: "/accounting/programs/events", label: "Event", icon: CalendarDays },
  { href: "/accounting/vouchers/levy", label: "Levy", icon: ReceiptText },
]

export default function ProgramBudgetPage() {
  return (
    <AccountingShell title="Budget" backHref="/accounting/programs" backLabel="Programs">
      <AccountingMenuList items={budgetItems} />
    </AccountingShell>
  )
}
