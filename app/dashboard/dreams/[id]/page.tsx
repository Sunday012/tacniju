import Link from "next/link"
import { notFound } from "next/navigation"
import { format, parseISO } from "date-fns"
import { ArrowLeft, CalendarDays } from "lucide-react"
import { getMyDream } from "@/app/actions/dreams"

export const dynamic = "force-dynamic"

export default async function DashboardDreamDetailPage({ params }: { params: { id: string } }) {
  const { dream } = await getMyDream(params.id)
  if (!dream) notFound()

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/dashboard/dreams" className="mb-6 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
        <ArrowLeft className="h-4 w-4" />
        Back to My Dreams
      </Link>

      <article className="rounded-lg border border-slate-200 bg-white/90 p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] sm:p-8">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {dream.category?.name && <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{dream.category.name}</span>}
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Dream Record</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{dream.title}</h1>
        <p className="mt-5 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-600">
          <CalendarDays className="h-4 w-4 text-indigo-600" />
          {format(parseISO(dream.dream_date), "MMMM d, yyyy")}
        </p>

        <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-slate-700">
          {dream.body}
        </div>
      </article>
    </div>
  )
}
