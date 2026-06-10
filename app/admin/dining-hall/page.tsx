import { createClient } from "@/lib/server"
import { isGuestProfile } from "@/lib/profile-kind"
import { Utensils, CalendarDays, Users, ClipboardCheck, FileText } from "lucide-react"
import Link from "next/link"
import { createDiningHallMeal } from "./actions"
import { DeleteAllMealsButton } from "@/components/admin/dining-hall/DeleteAllMealsButton"
import { DeleteMealButton } from "@/components/admin/dining-hall/DeleteMealButton"
import { RecordServingForm } from "@/components/admin/dining-hall/RecordServingForm"

export const dynamic = "force-dynamic"

export default async function DiningHallAdminPage() {
  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, reservation_number, rank, district, assembly, member_role, department, phone_number, points")
    .order("full_name", { ascending: true })
    .limit(80)
  const { data: meals, error: mealsError } = await supabase
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
        <div className="flex flex-col gap-4 rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Utensils className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Dining Hall</h1>
              <p className="mt-1 font-medium text-slate-500">Register camp meals, meal points, and manual plate serving per person.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm font-bold text-slate-600 sm:min-w-[390px]">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase tracking-widest text-slate-400">People</p>
              <p className="mt-1 text-2xl text-indigo-600">{people.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase tracking-widest text-slate-400">Unit</p>
              <p className="mt-1 text-2xl text-indigo-600">Plate</p>
            </div>
            <Link
              href="/admin/dining-hall/summary"
              className="flex flex-col justify-center rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-indigo-700 transition-colors hover:bg-indigo-100"
            >
              <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-indigo-400">
                <FileText className="h-4 w-4" />
                Summary
              </span>
              <span className="mt-1 text-lg font-black">Open</span>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-extrabold text-slate-800">Create Meal</h2>
            </div>
            <form action={createDiningHallMeal} className="grid gap-4">
              <label className="grid gap-1.5 text-sm font-bold text-slate-600">
                Meal name
                <input name="meal_name" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" placeholder="Meal name" required />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-slate-600">
                Camp day
                <input name="camp_day" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" placeholder="Camp day" required />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-slate-600">
                Meal time
                <input name="meal_time" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" placeholder="Meal time" required />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-bold text-slate-600">
                  Points allotted
                  <input name="points" type="number" min="0" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" placeholder="0" required />
                </label>
                <label className="grid gap-1.5 text-sm font-bold text-slate-600">
                  Unit
                  <input name="unit_name" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" placeholder="Plate" defaultValue="Plate" required />
                </label>
              </div>
              <button className="mt-2 h-11 rounded-xl bg-indigo-600 font-black text-white shadow-sm hover:bg-indigo-700">
                Save Meal Setup
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-extrabold text-slate-800">Meal Timetable</h2>
              </div>
              <DeleteAllMealsButton mealCount={mealRows.length} />
            </div>
            {mealsError ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-700">
                Dining Hall tables are not ready yet. Run `scripts/030_create_dining_hall_tables.sql` in Supabase.
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-widest text-slate-400">
                    <th className="py-3">Day</th>
                    <th>Meal</th>
                    <th>Time</th>
                    <th>Points</th>
                    <th>Unit</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                  {mealRows.length === 0 ? (
                    <tr>
                    <td colSpan={6} className="py-12 text-center font-medium text-slate-500">
                      No meals have been created yet.
                    </td>
                  </tr>
                  ) : mealRows.map(meal => (
                    <tr key={meal.id}>
                      <td className="py-4">{meal.camp_day}</td>
                      <td>{meal.meal_name}</td>
                      <td>{meal.meal_time}</td>
                      <td className="text-indigo-600">{meal.points}</td>
                      <td>{meal.unit_name}</td>
                      <td className="text-right">
                        <DeleteMealButton mealId={meal.id} mealName={meal.meal_name} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </section>
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
                  <th className="px-6 py-4">Phone</th>
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
                      <td className="px-6 py-4">{profile.phone_number || "-"}</td>
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
                        <RecordServingForm profileId={profile.id} meals={mealRows} />
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
