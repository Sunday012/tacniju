import Link from "next/link"
import { notFound } from "next/navigation"
import { format, parseISO } from "date-fns"
import { ArrowLeft, CalendarDays, UserRound } from "lucide-react"
import { getAdminDream } from "@/app/actions/dreams"
import { DeleteDreamButton } from "@/components/admin/dreams/DeleteDreamButton"

export const dynamic = "force-dynamic"

export default async function AdminDreamDetailPage({ params }: { params: { id: string } }) {
  const { dream } = await getAdminDream(params.id)
  if (!dream) notFound()

  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-[1100px] mx-auto w-full">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/admin/records/dreams/summary" className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" />
          Back to Summary
        </Link>
        <DeleteDreamButton dreamId={dream.id} title={dream.title} />
      </div>

      <article className="rounded-lg border border-slate-200 bg-white/90 p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] sm:p-8">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {dream.category?.name && <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{dream.category.name}</span>}
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Dream Record</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{dream.title}</h1>

        <div className="mt-5 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-600 sm:grid-cols-2">
          <p className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-indigo-600" />
            {format(parseISO(dream.dream_date), "MMMM d, yyyy")}
          </p>
          <p className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-indigo-600" />
            {dream.owner?.full_name || "Unnamed member"} {dream.owner?.reservation_number ? `(${dream.owner.reservation_number})` : ""}
          </p>
        </div>

        <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-slate-700">
          {dream.body}
        </div>
      </article>
    </main>
  )
}
