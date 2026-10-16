import Link from "next/link"
import { ArrowLeft, CalendarDays, FileText } from "lucide-react"
import { createClient } from "@/lib/server"
import { getAccountingOrgId } from "@/lib/accounting-org"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

type SearchParams = { event?: string }

function money(value: number) {
  return `NGN ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function dateLabel(value: string | null | undefined) {
  if (!value) return "-"
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

export default async function FinancialReportPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()
  const orgId = await getAccountingOrgId()
  const [{ data: events }, { data: budgets }] = await Promise.all([
    supabase.from("events").select("id, name, event_date").order("event_date", { ascending: false }),
    supabase.from("program_budget_sheets").select("id, title, budget_amount, event_id").eq("org_id", orgId).eq("budget_type", "Program").order("created_at", { ascending: false }),
  ])

  const selectedEvent = (events || []).find((event) => event.id === searchParams.event) || events?.[0] || null
  const selectedBudget = selectedEvent ? (budgets || []).find((budget) => budget.event_id === selectedEvent.id) : null
  const budgetAmount = Number(selectedBudget?.budget_amount || 0)

  return (
    <main className="min-h-screen flex-1 p-5 sm:p-8 lg:p-10">
      <div className="w-full">
        <Link href="/admin/office/secretariat/financial-secretary/finance-officer" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Finance Officer
        </Link>

        <header className="mt-8 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Financial Secretary</p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Financial Report</h1>
            <p className="mt-2 text-slate-500">Review the financial position of a selected event.</p>
          </div>
          <Button type="button" className="gap-2 bg-indigo-600 font-bold text-white hover:bg-indigo-700" disabled>
            <FileText className="h-4 w-4" />
            Print Report
          </Button>
        </header>

        <section className="mt-6 border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <form className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px_auto] sm:items-end" method="get">
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Event
              <select name="event" defaultValue={selectedEvent?.id || ""} className="h-11 w-full border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
                {!events?.length && <option value="">No events available</option>}
                {(events || []).map((event) => <option key={event.id} value={event.id}>{event.name} - {dateLabel(event.event_date)}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Date Prepared
              <input type="date" name="prepared" defaultValue={new Date().toISOString().slice(0, 10)} className="h-11 border border-slate-300 px-3 font-normal text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </label>
            <Button type="submit" variant="outline" className="h-11 gap-2 border-slate-300 font-bold text-slate-800">
              <CalendarDays className="h-4 w-4" />
              Load Event
            </Button>
          </form>
        </section>

        <section className="mt-6 overflow-hidden border border-slate-300 bg-white shadow-sm">
          <div className="border-b border-slate-300 px-5 py-4 sm:px-6">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Financial Report For</p>
            <h2 className="mt-1 text-xl font-extrabold text-slate-900">{selectedEvent?.name || "Select an event"}</h2>
            <p className="mt-1 text-sm text-slate-500">Event date: {dateLabel(selectedEvent?.event_date)}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                <tr><th className="px-5 py-3">Item</th><th className="px-5 py-3 text-right">Amount</th><th className="px-5 py-3">Notes</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr><td className="px-5 py-4 font-bold">Budget Amount</td><td className="px-5 py-4 text-right font-mono font-bold">{money(budgetAmount)}</td><td className="px-5 py-4 text-slate-500">Linked event program budget</td></tr>
                <tr><td className="px-5 py-4 font-bold">Workers’ Levy</td><td className="px-5 py-4 text-right font-mono">-</td><td className="px-5 py-4 text-slate-500">Event income</td></tr>
                <tr><td className="px-5 py-4 font-bold">Youth Levy</td><td className="px-5 py-4 text-right font-mono">-</td><td className="px-5 py-4 text-slate-500">Event income</td></tr>
                <tr><td className="px-5 py-4 font-bold">Amount Paid</td><td className="px-5 py-4 text-right font-mono">-</td><td className="px-5 py-4 text-slate-500">Payments recorded for this event</td></tr>
                <tr><td className="px-5 py-4 font-bold">Total Expenses</td><td className="px-5 py-4 text-right font-mono">-</td><td className="px-5 py-4 text-slate-500">Expenses recorded for this event</td></tr>
                <tr><td className="px-5 py-4 font-bold">List of Debtors</td><td className="px-5 py-4 text-right font-mono">-</td><td className="px-5 py-4 text-slate-500">No event debtors linked yet</td></tr>
                <tr><td className="px-5 py-4 font-bold">List of Creditors</td><td className="px-5 py-4 text-right font-mono">-</td><td className="px-5 py-4 text-slate-500">No event creditors linked yet</td></tr>
              </tbody>
              <tfoot className="border-t-2 border-slate-300 bg-slate-50"><tr><td className="px-5 py-4 text-base font-black">Grand Total</td><td className="px-5 py-4 text-right font-mono text-base font-black">{money(budgetAmount)}</td><td /></tr></tfoot>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
