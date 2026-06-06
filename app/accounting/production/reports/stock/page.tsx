import { AccountingShell } from "@/components/accounting/accounting-shell"
import { ProductionReportView } from "../production-report-view"

export default function ProductionStockReportsPage() {
  return (
    <AccountingShell title="Stock Reports" backHref="/accounting/production/reports" backLabel="Production Reports" showTitle={false}>
      <ProductionReportView
        title="Stock Reports"
        columns={["Item", "Category", "Opening Qty", "Inward Qty", "Outward Qty", "Closing Qty"]}
        emptyMessage="No stock report records found."
      />
    </AccountingShell>
  )
}
