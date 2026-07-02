import { BatchRegisterScreen } from "@/app/accounting/display/batch/batch-register-screen"

export default function ProductionBatchSummaryPage() {
  return (
    <BatchRegisterScreen
      title="Batch Summary"
      baseHref="/accounting/production/batch-summary"
      backHref="/accounting/production"
      backLabel="Production"
    />
  )
}
