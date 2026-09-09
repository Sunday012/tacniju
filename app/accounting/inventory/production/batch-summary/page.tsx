import { BatchRegisterScreen } from "@/app/accounting/display/batch/batch-register-screen"

export default function InventoryProductionBatchSummaryPage() {
  return (
    <BatchRegisterScreen
      title="Batch Summary"
      baseHref="/accounting/inventory/production/batch-summary"
      backHref="/accounting/inventory/production"
      backLabel="Production"
      mode="batch"
    />
  )
}
