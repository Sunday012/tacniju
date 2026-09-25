import Link from "next/link"
import { notFound } from "next/navigation"
import { format, parseISO } from "date-fns"
import { ArrowLeft, CalendarDays, FileText, Hash, UserRound } from "lucide-react"
import { getAdminDreams } from "@/app/actions/dreams"

export const dynamic = "force-dynamic"

export default async function DreamMonthSummaryPage({ params }: { params: { month: string } }) {
  const { dreams } = await getAdminDreams()

  // params.month should be "YYYY-MM"
  if (!/^\d{4}-\d{2}$/.test(params.month)) notFound()

  const monthDreams = dreams.filter(dream => dream.dream_date.startsWith(params.month))
  
  // Format the title (e.g. "January 2026")
  const title = format(parseISO(`${params.month}-01`), "MMMM yyyy")

  return (
    <main className="w-full flex-1 p-5 sm:p-8 lg:p-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin/records/dreams/summary?sort=month" className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
            Back to Summary
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-2 font-medium text-slate-500">{monthDreams.length} {monthDreams.length === 1 ? "dream" : "dreams"} documented this month.</p>
        </div>
      </div>

      <section className="space-y-2">
        {monthDreams.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white/85 p-10 text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-4 text-lg font-extrabold text-slate-800">No dreams documented this month</h2>
          </div>
        ) : (
          monthDreams.map(dream => (
            <Link key={dream.id} href={`/admin/records/dreams/summary/${dream.id}`} className="block rounded-lg border border-slate-200 bg-white/90 px-4 py-3 shadow-sm transition hover:border-indigo-200 hover:bg-white hover:shadow-md">
              <article className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-extrabold text-slate-900">{dream.title}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <UserRound className="h-3.5 w-3.5 text-indigo-500" />
                      {dream.owner?.full_name || "Unnamed member"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-mono">
                      <Hash className="h-3.5 w-3.5 text-indigo-500" />
                      {dream.owner?.reservation_number || "-"}
                    </span>
                  </div>
                </div>
                <p className="inline-flex shrink-0 items-center gap-1.5 text-xs font-black text-slate-500">
                  <CalendarDays className="h-3.5 w-3.5 text-indigo-500" />
                  {format(parseISO(dream.dream_date), "MMM d, yyyy")}
                </p>
              </article>
            </Link>
          ))
        )}
      </section>
    </main>
  )
}
