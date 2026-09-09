import { AccountingShell } from "@/components/accounting/accounting-shell"
import { ProductionMenuList, inventoryConsumptionItems } from "@/app/accounting/production/production-menu"

export default function InventoryConsumptionPage() {
  return (
    <AccountingShell title="Consumption" backHref="/accounting/inventory" backLabel="Inventory Info">
      <ProductionMenuList items={inventoryConsumptionItems} />
    </AccountingShell>
  )
}
