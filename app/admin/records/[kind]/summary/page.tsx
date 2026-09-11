import Link from "next/link"
import { format, parseISO } from "date-fns"
import { ArrowLeft, BookOpenText, CalendarDays, FolderTree, Printer } from "lucide-react"
import { getContentCategories, getContentRecords, requireContentRecordType } from "@/app/actions/content-records"
import { ContentRecordActions } from "@/components/admin/records/ContentRecordActions"
import { contentRecordLabels } from "@/lib/content-records"

export const dynamic = "force-dynamic"

type SortMode = "month" | "topic"

export default async function ContentRecordSummaryPage({
  params,
  searchParams,
}: {
  params: { kind: string }
  searchParams: { sort?: string }
}) {
  const kind = await requireContentRecordType(params.kind)
  const labels = contentRecordLabels[kind]
  const sort: SortMode = searchParams.sort === "topic" ? "topic" : "month"
  const [{ records, error: recordsError }, { categories, error: categoriesError }] = await Promise.all([
    getContentRecords(kind),
    getContentCategories(kind, true),
  ])
  const error = recordsError || categoriesError

  const groups = new Map<string, { title: string; records: typeof records }>()
  for (const record of records) {
    const key = sort === "topic" ? (record.category?.name || "Uncategorized") : record.record_date.slice(0, 7)
    const title = sort === "topic" ? key : format(parseISO(`${key}-01`), "MMMM yyyy")
    const current = groups.get(key) || { title, records: [] }
    current.records.push(record)
    groups.set(key, current)
  }

  const categoryNames = new Set(categories.map(category => category.name))
  const groupedRecords = Array.from(groups.entries())
    .sort(([aKey, a], [bKey, b]) => sort === "topic" ? a.title.localeCompare(b.title) : bKey.localeCompare(aKey))
    .map(([, value]) => value)

  return (
    <main className="mx-auto w-full max-w-[1600px] flex-1 p-5 sm:p-8 lg:p-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href={`/admin/records/${kind}`} className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
            Back to {labels.plural}
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{labels.plural} Summary</h1>
          <p className="mt-2 font-medium text-slate-500">Sorted by {sort === "topic" ? "topic" : "month"}.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/records/${kind}/summary?sort=month`} className={`inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-black ${sort === "month" ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>Monthly</Link>
          <Link href={`/admin/records/${kind}/summary?sort=topic`} className={`inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-black ${sort === "topic" ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>Topic</Link>
          <Link href={`/admin/records/${kind}/new`} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-black text-white shadow-sm hover:bg-indigo-700">
            <BookOpenText className="h-4 w-4" />
            New
          </Link>
          <Link href={`/admin/records/${kind}/print`} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 hover:bg-slate-50">
            <Printer className="h-4 w-4" />
            Print / PDF
          </Link>
        </div>
      </div>

      {error && <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">Run `scripts/044_create_content_records.sql` in Supabase.</div>}

      <section className="space-y-5">
        {records.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white/85 p-12 text-center">
            <FolderTree className="mx-auto h-12 w-12 text-slate-300" />
            <h2 className="mt-4 text-lg font-extrabold text-slate-800">No {labels.plural.toLowerCase()} documented yet</h2>
          </div>
        ) : groupedRecords.map(group => (
          <div key={group.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
              <h2 className="font-black text-slate-900">{group.title}</h2>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">{group.records.length}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {group.records.map(record => (
                <article key={record.id} className="grid gap-3 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-slate-900">{record.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500">
                      <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {format(parseISO(record.record_date), "MMM d, yyyy")}</span>
                      <span>{record.category?.name || "Uncategorized"}</span>
                      {record.owner?.full_name && <span>{record.owner.full_name}</span>}
                      {sort === "topic" && record.category?.name && !categoryNames.has(record.category.name) ? <span>Archived topic</span> : null}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{record.body}</p>
                  </div>
                  <ContentRecordActions recordType={kind} recordId={record.id} title={record.title} body={record.body} />
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}
