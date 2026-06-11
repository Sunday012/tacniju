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
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {mealRows.map(meal => (
              <div key={meal.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    {meal.camp_day}
                  </span>
                  <span className="text-[11px] font-black text-slate-500">{meal.meal_time} · {meal.unit_name} · <span className="text-indigo-600">{meal.points} pts</span></span>
                </div>
                <h3 className="truncate text-sm font-black text-slate-800">{meal.meal_name}</h3>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
