import { BatchFormScreen } from "@/app/accounting/display/batch/[id]/batch-form-screen"

export default function InventoryConsumptionTakeawayDetailPage({ params }: { params: { id: string } }) {
  return (
    <BatchFormScreen
      params={params}
      returnTo="consumption"
      backHref="/accounting/inventory/consumption/takeaway-summary"
      backLabel="Takeaway Summary"
      mode="takeaway"
    />
  )
}
