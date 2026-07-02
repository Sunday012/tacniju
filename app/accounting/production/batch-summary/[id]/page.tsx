import { BatchFormScreen } from "@/app/accounting/display/batch/[id]/batch-form-screen"

export default function ProductionBatchSummaryDetailPage({ params }: { params: { id: string } }) {
  return (
    <BatchFormScreen
      params={params}
      returnTo="production"
      backHref="/accounting/production/batch-summary"
      backLabel="Batch Summary"
    />
  )
}
