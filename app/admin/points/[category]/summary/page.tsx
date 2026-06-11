import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, FileText } from "lucide-react"
import { createClient } from "@/lib/server"
import { getPointCategory } from "@/lib/point-categories"

export const dynamic = "force-dynamic"

export default async function PointSummaryPage({ params }: { params: { category: string } }) {
  const category = getPointCategory(params.category)
  if (!category) notFound()

  const supabase = await createClient()
  const { data: records, error } = await supabase
    .from("point_work_records")
    .select("id, points, mode, profile_id, profile:profiles!profile_id(full_name, reservation_number, points)")
    .eq("category", category.slug)
    .order("created_at", { ascending: false })

  const grouped = new Map<string, any>()
  ;((records || []) as any[]).forEach(record => {
    const key = record.profile_id
    const current = grouped.get(key) || {
      profile: record.profile,
      added: 0,
      removed: 0,
      count: 0,
    }

    if (record.mode === "remove") {
      current.removed += Number(record.points || 0)
    } else {
      current.added += Number(record.points || 0)
    }
    current.count += 1
    grouped.set(key, current)
  })

  const rows = Array.from(grouped.values()).sort((a, b) => (b.added - b.removed) - (a.added - a.removed))

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <Link
            href={`/admin/points/${category.slug}`}
            className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-amber-200 bg-white px-4 text-sm font-black text-amber-700 shadow-sm hover:bg-amber-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {category.name}
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{category.name} Summary</h1>
        </div>

        <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 p-6">
            <FileText className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-extrabold text-slate-800">Summary</h2>
          </div>
          {error ? (
            <div className="p-6 text-sm font-bold text-rose-600">
              Could not load summary. Run `scripts/034_create_point_work_records.sql` in Supabase.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
                    <th className="px-6 py-4">Member</th>
                    <th className="px-6 py-4">Reservation</th>
                    <th className="px-6 py-4 text-right">Works</th>
                    <th className="px-6 py-4 text-right">Added</th>
                    <th className="px-6 py-4 text-right">Removed</th>
                    <th className="px-6 py-4 text-right">Net</th>
                    <th className="px-6 py-4 text-right">Current Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center font-medium text-slate-500">
                        No works have been created yet.
                      </td>
                    </tr>
                  ) : rows.map(row => {
                    const net = row.added - row.removed
                    return (
                      <tr key={row.profile?.reservation_number || row.profile?.full_name} className="font-medium text-slate-600">
                        <td className="px-6 py-4 font-bold text-slate-800">{row.profile?.full_name || "Unnamed"}</td>
                        <td className="px-6 py-4 font-mono">{row.profile?.reservation_number || "-"}</td>
                        <td className="px-6 py-4 text-right font-black">{row.count}</td>
                        <td className="px-6 py-4 text-right font-black text-indigo-600">{row.added}</td>
                        <td className="px-6 py-4 text-right font-black text-rose-600">{row.removed}</td>
                        <td className={net < 0 ? "px-6 py-4 text-right font-black text-rose-600" : "px-6 py-4 text-right font-black text-emerald-600"}>
                          {net > 0 ? "+" : ""}{net}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-indigo-600">{row.profile?.points || 0}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
