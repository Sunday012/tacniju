import Link from "next/link"
import { format, parseISO } from "date-fns"
import { ArrowLeft, FolderTree } from "lucide-react"
import { createDreamCategory, getDreamCategories } from "@/app/actions/dreams"
import { DreamCategoryActions } from "@/components/admin/dreams/DreamCategoryActions"

export const dynamic = "force-dynamic"

export default async function DreamCategoriesPage() {
  const { categories, error } = await getDreamCategories(true)

  async function createCategoryAction(formData: FormData) {
    "use server"
    await createDreamCategory(formData)
  }

  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-[1600px] mx-auto w-full">
      <Link href="/admin/records/dreams" className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
        <ArrowLeft className="h-4 w-4" />
        Back to Dreams
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dream Categories</h1>
        <p className="mt-2 font-medium text-slate-500">Group dream records so summaries are easier to scan.</p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          Dream category tables are not ready yet. Run `scripts/041_create_dream_records.sql` in Supabase.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(300px,380px)_1fr]">
        <form action={createCategoryAction} className="rounded-lg border border-white/70 bg-white p-4 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <FolderTree className="h-4 w-4" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900">Create Category</h2>
          </div>
          <div className="space-y-4">
            <label className="grid gap-2 text-sm font-bold text-slate-600">
              Name
              <input name="name" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" placeholder="Vision, Warning, Prayer..." required />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-600">
              Description
              <textarea name="description" rows={4} className="resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-indigo-300 focus:bg-white" placeholder="Optional category note" />
            </label>
            <button className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-black text-white shadow-sm hover:bg-indigo-700">
              Save Category
            </button>
          </div>
        </form>

        <section className="space-y-3">
          {categories.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white/85 p-12 text-center">
              <FolderTree className="mx-auto h-12 w-12 text-slate-300" />
              <h2 className="mt-4 text-lg font-extrabold text-slate-800">No categories yet</h2>
              <p className="mt-1 text-sm text-slate-500">Create the first dream category.</p>
            </div>
          ) : (
            categories.map(category => (
              <article key={category.id} className="rounded-lg border border-slate-200 bg-white/85 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-extrabold text-slate-900">{category.name}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${category.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {category.is_active ? "Active" : "Hidden"}
                      </span>
                    </div>
                    {category.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{category.description}</p>}
                    <p className="mt-3 text-xs font-semibold text-slate-400">{format(parseISO(category.created_at), "MMM d, yyyy")}</p>
                  </div>
                  <DreamCategoryActions id={category.id} isActive={category.is_active} />
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  )
}
