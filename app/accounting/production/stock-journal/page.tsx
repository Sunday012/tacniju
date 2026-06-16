import { ProductionJournalPage } from "../production-journal-page"
import { getProductionJournalById } from "../actions"

export default async function StockJournalPage({ searchParams }: { searchParams?: { edit?: string } }) {
  const initialJournal = searchParams?.edit
    ? await getProductionJournalById(searchParams.edit, "Production")
    : null

  return (
    <ProductionJournalPage
      journalType="Production"
      title="Stock Journal"
      subtitle="Consume source items and receive produced items."
      initialJournal={initialJournal}
    />
  )
}
