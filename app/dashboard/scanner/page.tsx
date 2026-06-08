import ScannerPage from "@/app/admin/scanner/page"
import { getCurrentAccessProfile, isUshering } from "@/lib/access"
import { redirect } from "next/navigation"
import Link from "next/link"
import { CalendarDays, Scan } from "lucide-react"

export default async function DashboardScannerPage({ searchParams }: { searchParams?: { eventId?: string; eventName?: string } }) {
  const { supabase, user, profile } = await getCurrentAccessProfile()
  if (!user) redirect("/auth/login")
  if (!isUshering(profile)) redirect("/dashboard")

  if (searchParams?.eventId) {
    return <ScannerPage />
  }

  const { data: events } = await supabase
    .from("events")
    .select("id, name, event_date, description")
    .order("event_date", { ascending: false })
    .limit(20)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600">
            <Scan className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Event Scanner</h1>
            <p className="mt-1 font-medium text-slate-500">Choose an event to start scanning attendance.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {(events || []).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center font-bold text-slate-500">
            No events are available yet.
          </div>
        ) : (events || []).map(event => (
          <Link
            key={event.id}
            href={`/dashboard/scanner?eventId=${event.id}&eventName=${encodeURIComponent(event.name)}`}
            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/40"
          >
            <div>
              <h2 className="font-black text-slate-800">{event.name}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-500">
                <CalendarDays className="h-4 w-4" />
                {event.event_date ? new Date(event.event_date).toLocaleDateString() : "No date"}
              </p>
            </div>
            <span className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-black text-white">Scan</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
