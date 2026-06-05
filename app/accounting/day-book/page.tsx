import { AccountingShell } from "@/components/accounting/accounting-shell"
import { DayBookView } from "@/components/reports/day-book-view"
import { getDayBook } from "@/app/reports/actions"

export default async function AccountingDayBookPage({
  searchParams,
}: {
  searchParams: { date?: string; start?: string; end?: string }
}) {
  const today = new Date().toISOString().slice(0, 10)
  const hasPeriodFilter = Boolean(searchParams.start || searchParams.end)
  const selectedDate = hasPeriodFilter ? "" : searchParams.date || today
  const startDate = searchParams.start || ""
  const endDate = searchParams.end || ""
  const data = hasPeriodFilter
    ? await getDayBook({ startDate: startDate || undefined, endDate: endDate || undefined })
    : await getDayBook({ date: selectedDate })

  return (
    <AccountingShell title="Day Book" showTitle={false}>
      <DayBookView
        data={data}
        actionPath="/accounting/day-book"
        selectedDate={selectedDate}
        startDate={startDate}
        endDate={endDate}
      />
    </AccountingShell>
  )
}
