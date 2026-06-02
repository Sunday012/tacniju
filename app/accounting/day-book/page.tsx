import { AccountingShell } from "@/components/accounting/accounting-shell"
import { DayBookView } from "@/components/reports/day-book-view"
import { getDayBook } from "@/app/reports/actions"

export default async function AccountingDayBookPage({ searchParams }: { searchParams: { date?: string } }) {
  const date = searchParams.date || new Date().toISOString().slice(0, 10)
  const data = await getDayBook(date)

  return (
    <AccountingShell title="Day Book" showTitle={false}>
      <DayBookView data={data} />
    </AccountingShell>
  )
}
