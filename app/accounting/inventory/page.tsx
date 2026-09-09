import { AccountingShell } from "@/components/accounting/accounting-shell"
import { ProductionMenuList, productionMenuItems } from "@/app/accounting/production/production-menu"

export default function AccountingInventoryPage() {
  return (
    <AccountingShell
      title="Inventory Information"
      hero={{
        eyebrow: "Inventory Info",
        title: "Inventory Information",
        badge: "Stock",
      }}
    >
      <ProductionMenuList items={productionMenuItems} />
    </AccountingShell>
  )
}
