import { BatchFormScreen } from "@/app/accounting/display/batch/[id]/batch-form-screen"

export default function InventoryProductionBatchSummaryDetailPage({ params }: { params: { id: string } }) {
  return (
    <BatchFormScreen
      params={params}
      returnTo="production"
      backHref="/accounting/inventory/production/batch-summary"
      backLabel="Batch Summary"
      mode="batch"
    />
  )
}
