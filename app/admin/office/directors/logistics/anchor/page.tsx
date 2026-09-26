import Link from "next/link"
import { ArrowLeft, CalendarDays, Presentation } from "lucide-react"
import { createClient } from "@/lib/server"
import { getAccountingOrgId } from "@/lib/accounting-org"

export const dynamic = "force-dynamic"

export default async function AnchorUnitPage() {
  const supabase = await createClient()
  const orgId = await getAccountingOrgId()
  const { data: services } = await supabase.from("logistics_order_services").select("id, title, status, updated_at, events(name, event_date)").eq("org_id", orgId).eq("status", "Posted").order("updated_at", { ascending: false })

  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10">
      <div className="w-full">
        <Link href="/admin/office/directors/logistics" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600">
          <ArrowLeft className="h-4 w-4" />
          Back to Logistics
        </Link>
        <header className="mt-8 border-b border-slate-200 pb-7">
          <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Logistics</p>
          <h1 className="mt-2 text-4xl font-extrabold text-slate-950">Anchor Unit</h1>
          <p className="mt-2 text-slate-500">Open the finished order, present it from a phone, or save it as PDF.</p>
        </header>
        <section className="mt-8 divide-y border border-slate-200 bg-white">
          {(services || []).map((service) => {
            const event = Array.isArray(service.events) ? service.events[0] : service.events
            return (
              <Link key={service.id} href={`/admin/office/directors/logistics/anchor/${service.id}`} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-indigo-50">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-indigo-100 bg-indigo-50 text-indigo-700">
                  <Presentation className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-slate-900">{service.title}</strong>
                  <span className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                    {event?.name || "Event"} · {event?.event_date ? new Date(`${event.event_date}T00:00:00`).toLocaleDateString("en-GB") : "Date not set"}
                  </span>
                </span>
              </Link>
            )
          })}
          {!services?.length && <p className="px-5 py-14 text-center text-slate-400">No posted orders of service yet.</p>}
        </section>
      </div>
    </main>
  )
}
