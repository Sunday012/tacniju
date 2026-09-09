import { StockJournalDiary } from "@/app/accounting/inventory/stock-journal-diary"

export default function InventoryProductionStockJournalPage() {
  return <StockJournalDiary title="Stock Journal" backHref="/accounting/inventory/production" backLabel="Production" movementType="IN" />
}
