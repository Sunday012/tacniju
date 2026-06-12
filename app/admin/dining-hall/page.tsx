import Link from "next/link"
import { ChefHat, ClipboardCheck, FileText, Utensils, Users } from "lucide-react"
import { createClient } from "@/lib/server"
import { CreateMealSheet } from "@/components/admin/dining-hall/CreateMealSheet"
import { getKitchenStockRows } from "@/app/accounting/production/actions"

export const dynamic = "force-dynamic"

const menuItems = [
  {
    href: "/admin/dining-hall/timetable",
    label: "Meal Timetable",
    icon: ClipboardCheck,
  },
  {
    href: "/admin/dining-hall/kitchen",
    label: "Kitchen",
    icon: ChefHat,
  },
  {
    href: "/admin/dining-hall/register",
    label: "Manual Plate Register",
    icon: Users,
  },
  {
    href: "/admin/dining-hall/summary",
    label: "Summary",
    icon: FileText,
  },
]

export default async function DiningHallAdminPage() {
  const supabase = await createClient()
  const kitchenRows = await getKitchenStockRows()
  const { count: peopleCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })

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
          <div className="grid gap-3 text-sm font-bold text-slate-600 sm:grid-cols-[120px_120px_auto]">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase tracking-widest text-slate-400">People</p>
              <p className="mt-1 text-2xl text-indigo-600">{peopleCount || 0}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase tracking-widest text-slate-400">Unit</p>
              <p className="mt-1 text-2xl text-indigo-600">Plate</p>
            </div>
            <div className="flex items-center">
              <CreateMealSheet kitchenItems={kitchenRows.map(row => ({
                name: row.name,
                quantity: row.quantity,
                unit: row.unit,
              }))} />
            </div>
          </div>
        </div>

        <section className="rounded-2xl border border-white/70 bg-white p-5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col gap-2">
            {menuItems.map(item => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-800 sm:text-base">{item.label}</h2>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
