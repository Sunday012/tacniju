import Link from "next/link"
import { notFound } from "next/navigation"
import { format, parseISO } from "date-fns"
import { ArrowLeft } from "lucide-react"
import { getContentRecord, requireContentRecordType } from "@/app/actions/content-records"
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

export default async function PrintContentRecordPage({ params }: { params: { kind: string; id: string } }) {
  const kind = await requireContentRecordType(params.kind)
  const labels = contentRecordLabels[kind]
  const { record } = await getContentRecord(kind, params.id)

  if (!record) notFound()

  return (
    <main className="min-h-screen bg-slate-100 p-5 text-slate-900 print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link href={`/admin/records/${kind}/summary`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
            Back to {labels.plural}
          </Link>
          <PrintButton label="Print / Save PDF" />
        </div>

        <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <header className="border-b border-slate-200 pb-5">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">{labels.singular}</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{record.title}</h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              {displayDate(record.record_date)}
              {" | "}
              {record.category?.name || "Uncategorized"}
              {record.owner?.full_name ? ` | ${record.owner.full_name}` : ""}
            </p>
          </header>
          <div className="mt-6 whitespace-pre-wrap text-base leading-8 text-slate-800">{record.body}</div>
        </article>
      </div>
    </main>
  )
}
