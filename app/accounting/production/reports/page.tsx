import { AccountingShell } from "@/components/accounting/accounting-shell"
import { ProductionMenuList, productionReportItems } from "../production-menu"

export default function ProductionReportsPage() {
  return (
    <AccountingShell title="Production Reports" backHref="/accounting/production" backLabel="Production">
      <ProductionMenuList items={productionReportItems} />
    </AccountingShell>
  )
}
