import Link from "next/link"
import { format, parseISO } from "date-fns"
import { Music, CalendarDays } from "lucide-react"
import { getMyContentRecords } from "@/app/actions/content-records"

export const dynamic = "force-dynamic"

function preview(body: string) {
  return body.length > 170 ? `${body.slice(0, 170)}...` : body
}

export default async function DashboardLyricsPage() {
  const { records, error } = await getMyContentRecords("lyrics")

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">My Lyrics</h1>
        <p className="mt-2 font-medium text-slate-500">Lyrics records attached to your name are shown here.</p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          Lyrics records are not ready yet.
        </div>
      )}

      <section className="space-y-3">
        {records.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white/85 p-12 text-center shadow-sm">
            <Music className="mx-auto h-12 w-12 text-slate-300" />
            <h2 className="mt-4 text-lg font-extrabold text-slate-800">No lyrics yet</h2>
            <p className="mt-1 text-sm text-slate-500">When a lyric is documented for you, it will appear here.</p>
          </div>
        ) : (
          records.map(record => (
            <Link key={record.id} href={`/dashboard/lyrics/${record.id}`} className="block rounded-lg border border-slate-200 bg-white/85 p-5 shadow-sm transition hover:border-indigo-200 hover:bg-white hover:shadow-md">
              <article>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-extrabold text-slate-900">{record.title}</h2>
                      {record.category?.name && <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">{record.category.name}</span>}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{preview(record.body)}</p>
                  </div>
                  <p className="flex shrink-0 items-center gap-2 text-xs font-bold text-slate-500 sm:justify-end">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {format(parseISO(record.record_date), "MMM d, yyyy")}
                  </p>
                </div>
              </article>
            </Link>
          ))
        )}
      </section>
    </div>
  )
}
