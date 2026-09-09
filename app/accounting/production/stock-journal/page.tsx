import { ProductionJournalPage } from "../production-journal-page"
import { getProductionJournalById } from "../actions"
import { StockJournalDiary } from "@/app/accounting/inventory/stock-journal-diary"

export default async function StockJournalPage({ searchParams }: { searchParams?: { edit?: string } }) {
  if (!searchParams?.edit) {
    return <StockJournalDiary title="Stock Journal" backHref="/accounting/inventory/production" backLabel="Production" />
  }

  const initialJournal = searchParams?.edit
    ? await getProductionJournalById(searchParams.edit, "Production")
    : null

  return (
    <ProductionJournalPage
      journalType="Production"
      title="Stock Journal"
      subtitle="Consume source items and receive produced items."
      initialJournal={initialJournal}
      backHref="/accounting/inventory/production/journal-summary"
      backLabel="Journal Summary"
    />
  )
}
