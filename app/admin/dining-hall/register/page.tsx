import Link from "next/link"
import { ArrowLeft, Users } from "lucide-react"
import { createClient } from "@/lib/server"
import { isGuestProfile } from "@/lib/profile-kind"
import { RecordServingForm } from "@/components/admin/dining-hall/RecordServingForm"
import { RemoveServingButton } from "@/components/admin/dining-hall/RemoveServingButton"

export const dynamic = "force-dynamic"

export default async function DiningHallRegisterPage() {
  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, reservation_number, rank, district, assembly, member_role, department, points")
    .order("full_name", { ascending: true })
    .limit(80)
  const { data: meals } = await supabase
    .from("dining_hall_meals")
    .select("id, meal_name, camp_day, meal_time, points, unit_name, active, created_at")
    .eq("active", true)
    .order("camp_day", { ascending: true })
    .order("meal_time", { ascending: true })
  const { data: servings, error: servingsError } = await supabase
    .from("dining_hall_servings")
    .select("id, profile_id, plates, served_at, meal:dining_hall_meals(meal_name), profile:profiles!profile_id(full_name)")
    .order("served_at", { ascending: false })
    .limit(500)

  const people = profiles || []
  const mealRows = meals || []
  const servingRows = (servings || []) as any[]
  const latestServingByProfile = new Map<string, any>()
  servingRows.forEach(serving => {
    if (serving.profile_id && !latestServingByProfile.has(serving.profile_id)) {
      latestServingByProfile.set(serving.profile_id, serving)
    }
  })

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <Link
            href="/admin/dining-hall"
            className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 text-sm font-black text-indigo-700 shadow-sm hover:bg-indigo-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dining Hall
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Manual Plate Register</h1>
        </div>

        <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 p-6">
            <Users className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-extrabold text-slate-800">Manual Plate Register</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Reservation</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Plate Unit</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {people.map(profile => {
                  const latestServing = latestServingByProfile.get(profile.id)
                  return (
                    <tr key={profile.id} className="font-medium text-slate-600">
                      <td className="px-6 py-4 font-bold text-slate-800">{profile.full_name || "Unnamed"}</td>
                      <td className="px-6 py-4 font-mono">{profile.reservation_number || "-"}</td>
                      <td className="px-6 py-4">{isGuestProfile(profile) ? "Guest" : (profile.member_role || profile.department || "Member")}</td>
                      <td className="px-6 py-4">1 plate</td>
                      <td className="px-6 py-4">
                        {latestServing ? (
                          <div className="inline-flex flex-col rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                            <span>Recorded</span>
                            <span className="mt-0.5 text-[11px] font-semibold text-emerald-600">
                              {latestServing.meal?.meal_name || "Meal"} · {new Date(latestServing.served_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-400">Not recorded</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <RecordServingForm profileId={profile.id} meals={mealRows} />
                          {latestServing ? (
                            <RemoveServingButton
                              profileId={profile.id}
                              personName={profile.full_name || "this person"}
                            />
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {servingsError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-bold text-rose-700">
            Could not load serving status: {servingsError.message}
          </div>
        ) : null}
      </div>
    </div>
  )
}
