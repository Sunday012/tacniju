import Link from "next/link"
import { Award } from "lucide-react"
import { pointCategories } from "@/lib/point-categories"

export const dynamic = "force-dynamic"

export default function PointsAdminPage() {
  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Points</h1>
              <p className="mt-1 font-medium text-slate-500">Manage workforce, negative, attendance, and special point work.</p>
            </div>
          </div>
        </div>

        <section className="rounded-2xl border border-white/70 bg-white p-5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col gap-2">
            {pointCategories.map(category => {
              const Icon = category.icon
              return (
                <Link
                  key={category.slug}
                  href={`/admin/points/${category.slug}`}
                  className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-800 sm:text-base">{category.name}</h2>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
