import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/server"
import { isGuestProfile } from "@/lib/profile-kind"

export const dynamic = "force-dynamic"

export default async function DiningHallMealSummaryPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const [{ data: meal }, { data: servings }] = await Promise.all([
    supabase
      .from("dining_hall_meals")
      .select("id, meal_name, camp_day, meal_time, points, unit_name, active")
      .eq("id", params.id)
      .eq("active", true)
      .maybeSingle(),
    supabase
      .from("dining_hall_servings")
      .select(`
        id,
        plates,
        served_at,
        profile:profiles!profile_id(
          full_name,
          reservation_number,
          member_role,
          department,
          phone_number
        )
      `)
      .eq("meal_id", params.id)
      .order("served_at", { ascending: false }),
  ])

  if (!meal) notFound()

  const servingRows = (servings || []) as any[]
  const totalPlates = servingRows.reduce((sum, serving) => sum + Number(serving.plates || 0), 0)
  const peopleServed = servingRows.length

  return (
    <div className="p-6 md:p-10">
      <div className="w-full space-y-8">
        <div>
          <Link
            href="/admin/dining-hall/summary"
            className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 text-sm font-black text-indigo-700 shadow-sm hover:bg-indigo-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Summary
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {meal.camp_day} - {meal.meal_name}
          </h1>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div className="grid gap-3 sm:grid-cols-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Meal</p>
                <p className="mt-1 font-black text-slate-900">{meal.meal_name}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Time</p>
                <p className="mt-1 font-black text-slate-900">{meal.meal_time}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">People Served</p>
                <p className="mt-1 font-black text-slate-900">{peopleServed.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Total Plates</p>
                <p className="mt-1 font-black text-slate-900">{totalPlates.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Reservation</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3 text-right">Plates</th>
                  <th className="px-4 py-3 text-right">Served At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {servingRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center font-semibold text-slate-500">
                      No servings have been recorded for this meal.
                    </td>
                  </tr>
                ) : servingRows.map(serving => {
                  const profile = serving.profile
                  return (
                    <tr key={serving.id} className="font-semibold text-slate-700">
                      <td className="px-4 py-3 font-black text-slate-900">{profile?.full_name || "Unnamed"}</td>
                      <td className="px-4 py-3 font-mono">{profile?.reservation_number || "-"}</td>
                      <td className="px-4 py-3">
                        {isGuestProfile(profile) ? "Guest" : (profile?.member_role || profile?.department || "Member")}
                      </td>
                      <td className="px-4 py-3">{profile?.phone_number || "-"}</td>
                      <td className="px-4 py-3 text-right font-black">{Number(serving.plates || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-slate-500">
                        {new Date(serving.served_at).toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
