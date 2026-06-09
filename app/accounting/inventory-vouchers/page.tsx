import { ReceiptText, ShoppingCart } from "lucide-react"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { AccountingMenuList } from "@/components/accounting/accounting-menu-list"

const voucherCards = [
  { href: "/accounting/vouchers/sales", label: "Sales", icon: ShoppingCart },
  { href: "/accounting/vouchers/purchase", label: "Purchase", icon: ShoppingCart },
  { href: "/accounting/vouchers/income", label: "Income", icon: ReceiptText },
  { href: "/accounting/programs", label: "Program", icon: ReceiptText },
]

export default function InventoryVouchersPage() {
  return (
    <AccountingShell title="Inventory Vouchers">
      <AccountingMenuList items={voucherCards} />
    </AccountingShell>
  )
}
