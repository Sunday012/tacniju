import Link from "next/link"
import { ArrowLeft, ClipboardList, Utensils } from "lucide-react"
import { createClient } from "@/lib/server"

export const dynamic = "force-dynamic"

export default async function DiningHallSummaryPage() {
  const supabase = await createClient()
  const { data: meals } = await supabase
    .from("dining_hall_meals")
    .select("id, meal_name, camp_day, meal_time, points, unit_name, active")
    .order("camp_day", { ascending: true })
    .order("meal_time", { ascending: true })

  const { data: servings } = await supabase
    .from("dining_hall_servings")
    .select("id, meal_id, profile_id, plates")

  const servingRows = servings || []
  const mealRows = meals || []

  const summaryItems = mealRows.map(meal => {
    const mealServings = servingRows.filter(serving => serving.meal_id === meal.id)
    const peopleServed = new Set(mealServings.map(serving => serving.profile_id)).size
    const totalPlates = mealServings.reduce((sum, serving) => sum + Number(serving.plates || 0), 0)

    return {
      ...meal,
      peopleServed,
      totalPlates,
      servingCount: mealServings.length,
    }
  })

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link
              href="/admin/dining-hall"
              className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 text-sm font-black text-indigo-700 shadow-sm hover:bg-indigo-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dining Hall
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dining Hall Summary</h1>
          </div>
        </div>

        <section className="rounded-2xl border border-white/70 bg-white p-5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]">
          {summaryItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm font-bold text-slate-500">
              No meals have been created yet.
            </div>
          ) : (
            <div className="space-y-2">
              {summaryItems.map(meal => (
                <Link
                  key={meal.id}
                  href={`/admin/dining-hall/summary/${meal.id}`}
                  className="grid gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40 sm:grid-cols-[1fr_auto]"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
                      <Utensils className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-base font-black text-slate-800">
                        {meal.camp_day} - {meal.meal_name}
                      </span>
                      <span className="block text-xs font-bold text-slate-500">
                        {meal.meal_time} · {meal.points} pts · {meal.unit_name}
                      </span>
                    </span>
                  </span>
                  <span className="flex items-center gap-2 text-xs font-black text-slate-500 sm:justify-end">
                    <ClipboardList className="h-4 w-4" />
                    {meal.peopleServed} people, {meal.totalPlates.toLocaleString()} plate(s)
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
