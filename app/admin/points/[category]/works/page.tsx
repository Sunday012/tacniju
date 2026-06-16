import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ClipboardList } from "lucide-react"
import { createClient } from "@/lib/server"
import { CreatePointWorkSheet } from "@/components/admin/points/CreatePointWorkSheet"
import { getPointCategory } from "@/lib/point-categories"

export const dynamic = "force-dynamic"

export default async function PointWorksPage({ params }: { params: { category: string } }) {
  const category = getPointCategory(params.category)
  if (!category) notFound()

  const supabase = await createClient()
  const [{ data: works, error }, { data: records }] = await Promise.all([
    supabase
      .from("point_works")
      .select("id, title, points, mode, note, created_at")
      .eq("category", category.slug)
      .order("created_at", { ascending: false }),
    supabase
      .from("point_work_records")
      .select("work_id")
      .eq("category", category.slug),
  ])

  const rows = (works || []) as any[]
  const countByWork = new Map<string, number>()
  ;((records || []) as any[]).forEach(record => {
    if (record.work_id) countByWork.set(record.work_id, (countByWork.get(record.work_id) || 0) + 1)
  })

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href={`/admin/points/${category.slug}`}
              className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-amber-200 bg-white px-4 text-sm font-black text-amber-700 shadow-sm hover:bg-amber-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {category.name}
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{category.name} Works</h1>
          </div>
          <CreatePointWorkSheet
            category={category.slug}
            categoryName={category.name}
            defaultMode={category.defaultMode}
          />
        </div>

        <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 p-6">
            <ClipboardList className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-extrabold text-slate-800">List of Works</h2>
          </div>
          {error ? (
            <div className="p-6 text-sm font-bold text-rose-600">
              Could not load works. Run `scripts/034_create_point_work_records.sql` in Supabase.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
                    <th className="px-6 py-4">Work</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4 text-right">Members</th>
                    <th className="px-6 py-4 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center font-medium text-slate-500">
                        No works have been created yet.
                      </td>
                    </tr>
                  ) : rows.map(record => (
                    <tr key={record.id} className="font-medium text-slate-600">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{record.title}</div>
                        {record.note ? <div className="mt-1 text-xs text-slate-400">{record.note}</div> : null}
                      </td>
                      <td className="px-6 py-4 capitalize">{record.mode}</td>
                      <td className="px-6 py-4 text-right font-black">{countByWork.get(record.id) || 0}</td>
                      <td className={record.mode === "remove" ? "px-6 py-4 text-right font-black text-rose-600" : "px-6 py-4 text-right font-black text-indigo-600"}>
                        {record.mode === "remove" ? "-" : "+"}{record.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
