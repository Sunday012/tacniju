import { Boxes, BookOpen, Users, Landmark } from "lucide-react"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { AccountingMenuList } from "@/components/accounting/accounting-menu-list"

const infoCards = [
  { href: "/accounting/info/group", label: "Groups", icon: Boxes },
  { href: "/accounting/info/ledger", label: "Ledgers", icon: BookOpen },
  { href: "/accounting/info/party", label: "Parties", icon: Users },
  { href: "/accounting/info/bank-account", label: "Bank Accounts", icon: Landmark },
]

export default function AccountingInfoPage() {
  return (
    <AccountingShell title="Accounts Info">
      <AccountingMenuList items={infoCards} />
    </AccountingShell>
  )
}
