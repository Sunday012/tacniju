import { BatchRegisterScreen } from "@/app/accounting/display/batch/batch-register-screen"

export default function InventoryConsumptionTakeawaySummaryPage() {
  return (
    <BatchRegisterScreen
      title="Takeaway Summary"
      baseHref="/accounting/inventory/consumption/takeaway-summary"
      backHref="/accounting/inventory/consumption"
      backLabel="Consumption"
      mode="takeaway"
      createLabel="New Takeaway"
      emptyMessage="No takeaways yet. Create the first takeaway to record stock going out."
    />
  )
}
