import { createClient } from "@/lib/server"
import { isGuestProfile } from "@/lib/profile-kind"
import { Utensils, CalendarDays, Users, ClipboardCheck } from "lucide-react"
import { createDiningHallMeal, recordDiningHallServing } from "./actions"
import { DeleteAllMealsButton } from "@/components/admin/dining-hall/DeleteAllMealsButton"
import { DeleteMealButton } from "@/components/admin/dining-hall/DeleteMealButton"

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
  const { data: servings } = await supabase
    .from("dining_hall_servings")
    .select("id, plates, served_at, meal:dining_hall_meals(meal_name), profile:profiles(full_name)")
    .order("served_at", { ascending: false })
    .limit(8)
  const people = profiles || []
  const mealRows = meals || []
  const servingRows = (servings || []) as any[]

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
          <div className="grid grid-cols-2 gap-3 text-sm font-bold text-slate-600 sm:min-w-[260px]">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase tracking-widest text-slate-400">People</p>
              <p className="mt-1 text-2xl text-indigo-600">{people.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase tracking-widest text-slate-400">Unit</p>
              <p className="mt-1 text-2xl text-indigo-600">Plate</p>
            </div>
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
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {people.map(profile => (
                  <tr key={profile.id} className="font-medium text-slate-600">
                    <td className="px-6 py-4 font-bold text-slate-800">{profile.full_name || "Unnamed"}</td>
                    <td className="px-6 py-4 font-mono">{profile.reservation_number || "-"}</td>
                    <td className="px-6 py-4">{isGuestProfile(profile) ? "Guest" : (profile.member_role || profile.department || "Member")}</td>
                    <td className="px-6 py-4">{profile.phone_number || "-"}</td>
                    <td className="px-6 py-4">1 plate</td>
                    <td className="px-6 py-4 text-right">
                      <form action={recordDiningHallServing} className="flex justify-end gap-2">
                        <input type="hidden" name="profile_id" value={profile.id} />
                        <select name="meal_id" className="h-9 max-w-[180px] rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-600" disabled={mealRows.length === 0} required>
                          <option value="">Select meal</option>
                          {mealRows.map(meal => (
                            <option key={meal.id} value={meal.id}>{meal.camp_day} - {meal.meal_name}</option>
                          ))}
                        </select>
                        <input name="plates" type="number" min="0.5" step="0.5" defaultValue="1" className="h-9 w-16 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-600" disabled={mealRows.length === 0} />
                        <button disabled={mealRows.length === 0} className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400">Record Food</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-lg font-extrabold text-slate-800">Recent Servings</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {servingRows.length === 0 ? (
              <div className="p-6 text-center font-medium text-slate-500">No servings have been recorded yet.</div>
            ) : servingRows.map(serving => (
              <div key={serving.id} className="flex flex-col gap-1 p-4 text-sm font-bold text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                <span>{serving.profile?.full_name || "Person"} received {serving.plates} plate(s) for {serving.meal?.meal_name || "meal"}</span>
                <span className="text-xs text-slate-400">{new Date(serving.served_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
