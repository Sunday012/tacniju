import Link from "next/link"
import { ArrowLeft, FolderTree, Plus } from "lucide-react"
import { createContentCategory, getContentCategories, requireContentRecordType } from "@/app/actions/content-records"
import { ContentCategoryActions } from "@/components/admin/records/ContentCategoryActions"
import { contentRecordLabels } from "@/lib/content-records"

export const dynamic = "force-dynamic"

export default async function ContentRecordCategoryPage({ params }: { params: { kind: string } }) {
  const kind = await requireContentRecordType(params.kind)
  const labels = contentRecordLabels[kind]
  const { categories, error } = await getContentCategories(kind, true)

  async function createAction(formData: FormData) {
    "use server"
    await createContentCategory(kind, formData)
  }

  return (
    <main className="mx-auto w-full max-w-[1600px] flex-1 p-5 sm:p-8 lg:p-10">
      <div className="mb-8">
        <Link href={`/admin/records/${kind}`} className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" />
          Back to {labels.plural}
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{labels.plural} Categories</h1>
      </div>

      {error && <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">Run `scripts/044_create_content_records.sql` in Supabase.</div>}

      <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <form action={createAction} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-900"><Plus className="h-5 w-5" /> New Category</h2>
          <div className="space-y-4">
            <input name="name" required placeholder="Category name" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-indigo-400" />
            <textarea name="description" placeholder="Description" rows={4} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
            <button className="h-11 w-full rounded-xl bg-indigo-600 px-4 text-sm font-black text-white hover:bg-indigo-700">Save Category</button>
          </div>
        </form>

        <div className="space-y-3">
          {categories.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">No categories yet.</div>
          ) : categories.map(category => (
            <article key={category.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <FolderTree className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-black text-slate-900">{category.name}</h2>
                {category.description && <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500">{category.description}</p>}
              </div>
              <ContentCategoryActions recordType={kind} categoryId={category.id} isActive={category.is_active} />
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
