import Link from "next/link"
import { createClient } from "@/lib/server"
import { getAccountingOrgId } from "@/lib/accounting-org"

export const dynamic = "force-dynamic"

export default async function OrderOfServiceDisplayPage() {
  const [supabase, orgId] = await Promise.all([createClient(), getAccountingOrgId()])
  const today = new Date().toISOString().slice(0, 10)
  const { data: services } = await supabase.from("logistics_order_services").select("id, title, events!inner(name, event_date)").eq("org_id", orgId).eq("status", "Posted").gte("events.event_date", today).limit(1)
  const service = services?.[0]
  const { data: items } = service ? await supabase.from("logistics_order_service_items").select("id, title, item_type, scheduled_time, sort_order").eq("order_service_id", service.id).order("sort_order") : { data: [] }
  const event = service ? (Array.isArray(service.events) ? service.events[0] : service.events) : null

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col justify-center">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-amber-300">TACN Iju</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-7xl">{service?.title || "Order of Service"}</h1>
            <p className="mt-2 text-lg font-bold text-slate-300">
              {event?.name || "No current service posted"}
              {event?.event_date ? ` · ${new Date(`${event.event_date}T00:00:00`).toLocaleDateString("en-GB", { dateStyle: "long" })}` : ""}
            </p>
          </div>
          <Link href="/present" className="border border-white/20 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10">
            Display Menu
          </Link>
        </header>
        <ol className="grid gap-3 sm:grid-cols-2">
          {(items || []).map((item, index) => (
            <li key={item.id} className="flex min-h-24 items-center gap-5 border border-white/10 bg-white/[0.06] p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-amber-300 text-xl font-black text-slate-950">{index + 1}</span>
              <span className="min-w-0 flex-1">
                <strong className="block text-xl font-black sm:text-2xl">{item.title}</strong>
                {item.scheduled_time && <small className="mt-1 block font-mono text-amber-200">{item.scheduled_time.slice(0, 5)}</small>}
              </span>
            </li>
          ))}
          {!items?.length && <li className="col-span-full border border-dashed border-white/20 px-6 py-16 text-center text-xl text-slate-400">Logistics has not posted a current order of service.</li>}
        </ol>
      </div>
    </main>
  )
}
