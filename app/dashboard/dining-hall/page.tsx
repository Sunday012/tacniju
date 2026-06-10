import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { CalendarDays, Utensils } from "lucide-react"

export default async function MemberDiningHallPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: meals, error: mealsError } = await supabase
    .from("dining_hall_meals")
    .select("id, meal_name, camp_day, meal_time, points, unit_name")
    .eq("active", true)
    .order("camp_day", { ascending: true })
    .order("meal_time", { ascending: true })
  const mealRows = meals || []

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] backdrop-blur-3xl sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600">
            <Utensils className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Dining Hall</h1>
            <p className="mt-1 font-medium text-slate-500">View the camp meal timetable and the points attached to each meal.</p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] backdrop-blur-3xl sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-extrabold text-slate-800">Meal Timetable</h2>
        </div>
        {mealsError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-12 text-center">
            <p className="font-bold text-amber-700">Dining Hall timetable is not ready yet.</p>
          </div>
        ) : mealRows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <p className="font-bold text-slate-500">No meals have been added to the timetable yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
                  <th className="px-4 py-3 font-black">Day</th>
                  <th className="px-4 py-3 font-black">Meal</th>
                  <th className="px-4 py-3 font-black">Time</th>
                  <th className="px-4 py-3 font-black">Points</th>
                  <th className="px-4 py-3 font-black">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mealRows.map(meal => (
                  <tr key={meal.id} className="font-bold text-slate-700">
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-slate-500">
                        {meal.camp_day}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-black text-slate-800">{meal.meal_name}</td>
                    <td className="px-4 py-3">{meal.meal_time}</td>
                    <td className="px-4 py-3 text-indigo-600">{meal.points} pts</td>
                    <td className="px-4 py-3">{meal.unit_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
