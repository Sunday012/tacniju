import { AccountingShell } from "@/components/accounting/accounting-shell"
import { ProductionReportView } from "../reports/production-report-view"

export default function JournalSummaryPage() {
  return (
    <AccountingShell title="Journal Summary" backHref="/accounting/production" backLabel="Production" showTitle={false}>
      <ProductionReportView
        title="Journal Summary"
        columns={["Voucher No.", "Batch No.", "Journal Type", "Items", "Total Qty", "Narration"]}
        emptyMessage="No production journals have been summarized yet."
      />
    </AccountingShell>
  )
}
