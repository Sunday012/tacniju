import Link from "next/link"
import { format, parseISO } from "date-fns"
import { ArrowLeft, BookOpenText, CalendarDays, FolderTree } from "lucide-react"
import { getAdminDreams, getDreamCategories } from "@/app/actions/dreams"

export const dynamic = "force-dynamic"

export default async function DreamSummaryPage({ searchParams }: { searchParams: { sort?: string } }) {
  const sort = searchParams.sort === "month" ? "month" : "topic"
  const [{ dreams, error: dreamsError }, { categories, error: categoriesError }] = await Promise.all([
    getAdminDreams(),
    getDreamCategories(true),
  ])
  const error = dreamsError || categoriesError

  const dreamCounts = new Map<string, { count: number; latestDate: string | null }>()
  for (const dream of dreams) {
    const key = dream.category_id || "uncategorized"
    const current = dreamCounts.get(key) || { count: 0, latestDate: null }
    dreamCounts.set(key, {
      count: current.count + 1,
      latestDate: !current.latestDate || dream.dream_date > current.latestDate ? dream.dream_date : current.latestDate,
    })
  }

  const categorySummaries = categories
    .map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      isActive: category.is_active,
      count: dreamCounts.get(category.id)?.count || 0,
      latestDate: dreamCounts.get(category.id)?.latestDate || null,
    }))
    .filter(category => category.count > 0 || category.isActive)

  const uncategorized = dreamCounts.get("uncategorized")
  if (uncategorized) {
    categorySummaries.push({
      id: "uncategorized",
      name: "Uncategorized",
      description: "Dream records that have not been assigned to a category.",
      isActive: true,
      count: uncategorized.count,
      latestDate: uncategorized.latestDate,
    })
  }

  const monthlySummaries = Array.from(dreams.reduce((map, dream) => {
    const key = dream.dream_date.slice(0, 7)
    const current = map.get(key) || { key, count: 0, latestDate: dream.dream_date }
    current.count += 1
    if (dream.dream_date > current.latestDate) current.latestDate = dream.dream_date
    map.set(key, current)
    return map
  }, new Map<string, { key: string; count: number; latestDate: string }>()).values())
    .sort((a, b) => b.key.localeCompare(a.key))

  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-[1600px] mx-auto w-full">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin/records/dreams" className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
            Back to Dreams
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dream Summary</h1>
          <p className="mt-2 font-medium text-slate-500">Dreams are grouped by {sort === "month" ? "month" : "topic"} before opening the individual records.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/records/dreams/summary?sort=topic" className={`inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-black ${sort === "topic" ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>Topic</Link>
          <Link href="/admin/records/dreams/summary?sort=month" className={`inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-black ${sort === "month" ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>Monthly</Link>
          <Link href="/admin/records/dreams/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-black text-white shadow-sm hover:bg-indigo-700">
            <BookOpenText className="h-4 w-4" />
            New Dream
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          Dream tables are not ready yet. Run `scripts/041_create_dream_records.sql` in Supabase.
        </div>
      )}

      <section className="space-y-3">
        {dreams.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white/85 p-12 text-center">
            <FolderTree className="mx-auto h-12 w-12 text-slate-300" />
            <h2 className="mt-4 text-lg font-extrabold text-slate-800">No dreams documented yet</h2>
            <p className="mt-1 text-sm text-slate-500">Create a new dream record to begin the summary.</p>
          </div>
        ) : sort === "month" ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {monthlySummaries.map(month => (
              <Link key={month.key} href={`/admin/records/dreams/summary?sort=month#${month.key}`} className="block rounded-lg border border-slate-200 bg-white/85 p-4 shadow-sm transition hover:border-indigo-200 hover:bg-white hover:shadow-md">
                <article className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="truncate text-base font-extrabold text-slate-900">{format(parseISO(`${month.key}-01`), "MMMM yyyy")}</h2>
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">
                        {month.count} {month.count === 1 ? "dream" : "dreams"}
                      </span>
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Latest: {format(parseISO(month.latestDate), "MMM d, yyyy")}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {categorySummaries.map(category => (
              <Link key={category.id} href={`/admin/records/dreams/summary/category/${category.id}`} className="block rounded-lg border border-slate-200 bg-white/85 p-4 shadow-sm transition hover:border-indigo-200 hover:bg-white hover:shadow-md">
                <article className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <FolderTree className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="truncate text-base font-extrabold text-slate-900">{category.name}</h2>
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">
                        {category.count} {category.count === 1 ? "dream" : "dreams"}
                      </span>
                    </div>
                    {category.description && <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500">{category.description}</p>}
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {category.latestDate ? `Latest: ${format(parseISO(category.latestDate), "MMM d, yyyy")}` : "No records yet"}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
