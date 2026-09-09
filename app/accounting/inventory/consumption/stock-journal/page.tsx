import { StockJournalDiary } from "@/app/accounting/inventory/stock-journal-diary"

export default function InventoryConsumptionStockJournalPage() {
  return <StockJournalDiary title="Stock Journal" backHref="/accounting/inventory/consumption" backLabel="Consumption" movementType="OUT" />
}
