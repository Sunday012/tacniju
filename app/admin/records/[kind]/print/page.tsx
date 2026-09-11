import Link from "next/link"
import { format, parseISO } from "date-fns"
import { ArrowLeft } from "lucide-react"
import { getContentRecords, requireContentRecordType } from "@/app/actions/content-records"
import { PrintButton } from "@/components/print-button"
import { contentRecordLabels } from "@/lib/content-records"

export const dynamic = "force-dynamic"

function displayDate(value: string) {
  try {
    return format(parseISO(value), "MMM d, yyyy")
  } catch {
    return value
  }
}

export default async function PrintContentRecordsPage({ params }: { params: { kind: string } }) {
  const kind = await requireContentRecordType(params.kind)
  const labels = contentRecordLabels[kind]
  const { records } = await getContentRecords(kind)
  const sortedRecords = [...records].sort((a, b) => b.record_date.localeCompare(a.record_date) || a.title.localeCompare(b.title))

  return (
    <main className="min-h-screen bg-slate-100 p-5 text-slate-900 print:bg-white print:p-0">
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link href={`/admin/records/${kind}/summary`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
            Back to Summary
          </Link>
          <PrintButton label="Print / Save PDF" />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <header className="border-b border-slate-200 pb-5">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">Records</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{labels.plural}</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">{sortedRecords.length} {sortedRecords.length === 1 ? labels.singular.toLowerCase() : labels.plural.toLowerCase()}</p>
          </header>

          <div className="divide-y divide-slate-200">
            {sortedRecords.length === 0 ? (
              <p className="py-8 text-sm font-semibold text-slate-500">No {labels.plural.toLowerCase()} documented yet.</p>
            ) : sortedRecords.map(record => (
              <article key={record.id} className="break-inside-avoid py-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold">{record.title}</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {displayDate(record.record_date)}
                      {" | "}
                      {record.category?.name || "Uncategorized"}
                      {record.owner?.full_name ? ` | ${record.owner.full_name}` : ""}
                    </p>
                  </div>
                </div>
                <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-800">{record.body}</div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
