import { AccountingShell } from "@/components/accounting/accounting-shell"
import { ProductionMenuList, inventoryProductionItems } from "@/app/accounting/production/production-menu"

export default function InventoryProductionPage() {
  return (
    <AccountingShell title="Production" backHref="/accounting/inventory" backLabel="Inventory Info">
      <ProductionMenuList items={inventoryProductionItems} />
    </AccountingShell>
  )
}
