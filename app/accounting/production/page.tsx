import { AccountingShell } from "@/components/accounting/accounting-shell"
import { ProductionMenuList, productionMenuItems } from "./production-menu"

export default function ProductionPage() {
  return (
    <AccountingShell title="Production">
      <ProductionMenuList items={productionMenuItems} />
    </AccountingShell>
  )
}
