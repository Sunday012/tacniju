import Link from "next/link"
import { ArrowLeft, ClipboardCheck } from "lucide-react"
import { createClient } from "@/lib/server"
import { CreateMealSheet } from "@/components/admin/dining-hall/CreateMealSheet"
import { DeleteAllMealsButton } from "@/components/admin/dining-hall/DeleteAllMealsButton"
import { DeleteMealButton } from "@/components/admin/dining-hall/DeleteMealButton"
import { getKitchenStockRows } from "@/app/accounting/production/actions"

export const dynamic = "force-dynamic"

export default async function DiningHallTimetablePage() {
  const supabase = await createClient()
  const kitchenRows = await getKitchenStockRows()
  const { data: meals, error: mealsError } = await supabase
    .from("dining_hall_meals")
    .select("id, meal_name, camp_day, meal_time, points, unit_name, active, created_at")
    .eq("active", true)
    .order("camp_day", { ascending: true })
    .order("meal_time", { ascending: true })
  const mealRows = meals || []

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/admin/dining-hall"
              className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 text-sm font-black text-indigo-700 shadow-sm hover:bg-indigo-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dining Hall
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Meal Timetable</h1>
          </div>
          <CreateMealSheet kitchenItems={kitchenRows.map(row => ({
            name: row.name,
            quantity: row.quantity,
            unit: row.unit,
          }))} />
        </div>

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
    </div>
  )
}
