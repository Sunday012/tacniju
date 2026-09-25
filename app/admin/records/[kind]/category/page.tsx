import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createContentCategory, getContentCategories, requireContentRecordType } from "@/app/actions/content-records"
import { contentRecordLabels } from "@/lib/content-records"
import { CategoryHierarchyManager } from "@/components/admin/records/CategoryHierarchyManager"

export const dynamic = "force-dynamic"

export default async function ContentRecordCategoryPage({ params }: { params: { kind: string } }) {
  const kind = await requireContentRecordType(params.kind)
  const labels = contentRecordLabels[kind]
  const { categories, error } = await getContentCategories(kind, true)

  async function createAction(formData: FormData) {
    "use server"
    return await createContentCategory(kind, formData)
  }

  return (
    <main className="w-full flex-1 p-5 sm:p-8 lg:p-10">
      <div className="mb-6">
        <Link href={`/admin/records/${kind}`} className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" />
          Back to {labels.plural}
        </Link>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          Run `scripts/044_create_content_records.sql` in Supabase.
        </div>
      )}

      <CategoryHierarchyManager
        categories={categories}
        recordType={kind}
        labels={labels}
        createAction={createAction}
      />
    </main>
  )
}
