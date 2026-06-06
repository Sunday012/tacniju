import { AccountingShell } from "@/components/accounting/accounting-shell"
import { ProductionMenuList, productionInventoryItems } from "../production-menu"

export default function ProductionInventoryPage() {
  return (
    <AccountingShell title="Production Inventory" backHref="/accounting/production" backLabel="Production">
      <ProductionMenuList items={productionInventoryItems} />
    </AccountingShell>
  )
}
