import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ClipboardList, FileText } from "lucide-react"
import { createClient } from "@/lib/server"
import { CreatePointWorkSheet } from "@/components/admin/points/CreatePointWorkSheet"
import { getPointCategory } from "@/lib/point-categories"

export const dynamic = "force-dynamic"

export default async function PointCategoryPage({ params }: { params: { category: string } }) {
  const category = getPointCategory(params.category)
  if (!category) notFound()

  const supabase = await createClient()
  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, points")
    .order("full_name", { ascending: true })
    .limit(200)

  const menuItems = [
    { href: `/admin/points/${category.slug}/works`, label: "List of Works", icon: ClipboardList },
    { href: `/admin/points/${category.slug}/summary`, label: "Summary", icon: FileText },
  ]

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/admin/points"
              className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-amber-200 bg-white px-4 text-sm font-black text-amber-700 shadow-sm hover:bg-amber-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Points
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{category.name}</h1>
          </div>
          <CreatePointWorkSheet
            category={category.slug}
            categoryName={category.name}
            defaultMode={category.defaultMode}
            members={members || []}
          />
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
