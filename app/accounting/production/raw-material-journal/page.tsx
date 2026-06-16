import { ProductionJournalPage } from "../production-journal-page"
import { getProductionJournalById } from "../actions"

export default async function RawMaterialJournalPage({ searchParams }: { searchParams?: { edit?: string } }) {
  const initialJournal = searchParams?.edit
    ? await getProductionJournalById(searchParams.edit, "Raw Material")
    : null

  return (
    <ProductionJournalPage
      journalType="Raw Material"
      title="Raw Material Journal"
      subtitle="Receive, issue, and consume raw materials for production."
      initialJournal={initialJournal}
    />
  )
}
