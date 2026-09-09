import { ProductionJournalPage } from "@/app/accounting/production/production-journal-page"
import { getProductionJournalById } from "@/app/accounting/production/actions"

export default async function KitchenJournalPage({ searchParams }: { searchParams?: { edit?: string } }) {
  const initialJournal = searchParams?.edit
    ? await getProductionJournalById(searchParams.edit, "Raw Material")
    : null

  return (
    <ProductionJournalPage
      journalType="Raw Material"
      title="Kitchen"
      subtitle="Record stock received into the kitchen and stock consumed from it."
      initialJournal={initialJournal}
      backHref="/accounting/inventory/consumption"
      backLabel="Consumption"
    />
  )
}
