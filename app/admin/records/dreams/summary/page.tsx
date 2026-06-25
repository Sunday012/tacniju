import Link from "next/link"
import { format, parseISO } from "date-fns"
import { ArrowLeft, BookOpenText, CalendarDays, UserRound } from "lucide-react"
import { getAdminDreams } from "@/app/actions/dreams"

export const dynamic = "force-dynamic"

function preview(body: string) {
  return body.length > 180 ? `${body.slice(0, 180)}...` : body
}

export default async function DreamSummaryPage() {
  const { dreams, error } = await getAdminDreams()

  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-[1600px] mx-auto w-full">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin/records/dreams" className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
            Back to Dreams
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dream Summary</h1>
          <p className="mt-2 font-medium text-slate-500">Individual dream records are listed here and open into their full details.</p>
        </div>
        <Link href="/admin/records/dreams/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-black text-white shadow-sm hover:bg-indigo-700">
          <BookOpenText className="h-4 w-4" />
          New Dream
        </Link>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          Dream tables are not ready yet. Run `scripts/041_create_dream_records.sql` in Supabase.
        </div>
      )}

      <section className="space-y-3">
        {dreams.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white/85 p-12 text-center">
            <BookOpenText className="mx-auto h-12 w-12 text-slate-300" />
            <h2 className="mt-4 text-lg font-extrabold text-slate-800">No dreams documented yet</h2>
            <p className="mt-1 text-sm text-slate-500">Create a new dream record to begin the summary.</p>
          </div>
        ) : (
          dreams.map(dream => (
            <Link key={dream.id} href={`/admin/records/dreams/summary/${dream.id}`} className="block rounded-lg border border-slate-200 bg-white/85 p-5 shadow-sm transition hover:border-indigo-200 hover:bg-white hover:shadow-md">
              <article>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-extrabold text-slate-900">{dream.title}</h2>
                      {dream.category?.name && (
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">{dream.category.name}</span>
                      )}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{preview(dream.body)}</p>
                  </div>
                  <div className="shrink-0 space-y-2 text-xs font-bold text-slate-500 sm:text-right">
                    <p className="flex items-center gap-2 sm:justify-end">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {format(parseISO(dream.dream_date), "MMM d, yyyy")}
                    </p>
                    <p className="flex items-center gap-2 sm:justify-end">
                      <UserRound className="h-3.5 w-3.5" />
                      {dream.owner?.full_name || "Unnamed member"}
                    </p>
                    {dream.owner?.reservation_number && <p className="font-mono text-slate-400">{dream.owner.reservation_number}</p>}
                  </div>
                </div>
              </article>
            </Link>
          ))
        )}
      </section>
    </main>
  )
}
