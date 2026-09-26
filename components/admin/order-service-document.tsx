import { Clock } from "lucide-react"

export type OrderServiceDocumentData = {
  title: string
  status?: string
  events: { name: string; event_date: string } | { name: string; event_date: string }[] | null
  items: Array<{
    id: string
    title: string
    item_type: string
    scheduled_time: string | null
    sort_order: number
  }>
}

export function OrderServiceDocument({ service }: { service: OrderServiceDocumentData }) {
  const event = Array.isArray(service.events) ? service.events[0] : service.events
  return (
    <article className="mx-auto w-full max-w-4xl border border-slate-300 bg-white text-slate-900 shadow-sm print:max-w-none print:border-0 print:shadow-none">
      <header className="border-b-2 border-slate-900 px-6 py-7 text-center sm:px-10">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-700 print:text-black">TACN Iju Youth</p>
        <h1 className="mt-3 text-3xl font-black sm:text-4xl">{service.title}</h1>
        <p className="mt-2 font-semibold text-slate-600">
          {event?.name || "Event"} · {event?.event_date ? new Date(`${event.event_date}T00:00:00`).toLocaleDateString("en-GB", { dateStyle: "long" }) : "Date not set"}
        </p>
      </header>
      <ol className="divide-y divide-slate-200">
        {service.items.map((item, index) => (
          <li key={item.id} className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 px-6 py-4 sm:px-10">
            <span className="flex h-9 w-9 items-center justify-center bg-slate-900 font-black text-white">{index + 1}</span>
            <div>
              <p className="font-extrabold">{item.title}</p>
              <p className="text-xs font-bold uppercase text-slate-500">{item.item_type}</p>
            </div>
            <span className="flex items-center gap-1 font-mono text-sm font-bold text-slate-600">
              {item.scheduled_time && (
                <>
                  <Clock className="h-4 w-4" />
                  {item.scheduled_time.slice(0, 5)}
                </>
              )}
            </span>
          </li>
        ))}
        {!service.items.length && <li className="px-6 py-14 text-center text-slate-400">No service items have been added.</li>}
      </ol>
    </article>
  )
}
