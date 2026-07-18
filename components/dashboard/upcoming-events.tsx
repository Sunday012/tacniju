import { createClient } from "@/lib/server"
import { CalendarDays, Clock } from "lucide-react"
import { format, parseISO, isToday, isTomorrow, differenceInDays } from "date-fns"

async function getUpcomingEvents() {
  const supabase = await createClient()
  const today = new Date().toISOString().split("T")[0]

  const { data } = await supabase
    .from("events")
    .select("id, name, description, event_date")
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(5)

  return data || []
}

function getRelativeLabel(dateStr: string) {
  const date = parseISO(dateStr)
  if (isToday(date)) return { label: "Today", color: "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900" }
  if (isTomorrow(date)) return { label: "Tomorrow", color: "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900" }
  const diff = differenceInDays(date, new Date())
  return { label: `In ${diff} days`, color: "text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-900" }
}

export async function UpcomingEvents() {
  const events = await getUpcomingEvents()

  return (
    <div className="bg-white/80 backdrop-blur-3xl border border-white/60 rounded-lg p-6 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] transition-all dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-lg shadow-sm border border-violet-100/50 dark:from-slate-950 dark:to-slate-950 dark:border-slate-800">
          <CalendarDays className="w-[20px] h-[20px] text-violet-600" />
        </div>
        <div>
          <h3 className="text-[17px] font-extrabold text-slate-800 tracking-tight dark:text-slate-100">Upcoming Events</h3>
          <p className="text-[12px] text-slate-400 font-medium dark:text-slate-400">Events planned by the leadership</p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-slate-300 space-y-2 dark:text-slate-500">
          <CalendarDays className="w-10 h-10" />
          <p className="text-sm text-slate-400 font-medium dark:text-slate-400">No upcoming events</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => {
            const { label, color } = getRelativeLabel(event.event_date)
            return (
              <li key={event.id} className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50/80 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors dark:bg-slate-950 dark:border-slate-800 dark:hover:border-indigo-900 dark:hover:bg-slate-950">
                <div className="mt-0.5 p-2 rounded-lg bg-white shadow-sm border border-slate-100 shrink-0 dark:bg-slate-900 dark:border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate dark:text-slate-100">{event.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 dark:text-slate-400">
                    {format(parseISO(event.event_date), "EEEE, MMMM d, yyyy")}
                  </p>
                  {event.description && (
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 dark:text-slate-400">{event.description}</p>
                  )}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border shrink-0 ${color}`}>
                  {label}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
