import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createDreamCategory, getDreamCategories } from "@/app/actions/dreams"
import { CategoryHierarchyManager } from "@/components/admin/records/CategoryHierarchyManager"

export const dynamic = "force-dynamic"

export default async function DreamCategoriesPage() {
  const { categories, error } = await getDreamCategories(true)

  async function createAction(formData: FormData) {
    "use server"
    return await createDreamCategory(formData)
  }

  return (
    <main className="mx-auto w-full max-w-[1600px] flex-1 p-5 sm:p-8 lg:p-10">
      <div className="mb-6">
        <Link href="/admin/records/dreams" className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" />
          Back to Dreams
        </Link>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          Dream category tables are not ready yet. Run `scripts/041_create_dream_records.sql` in Supabase.
        </div>
      )}

      <CategoryHierarchyManager
        categories={categories}
        labels={{ singular: "Dream", plural: "Dream" }}
        createAction={createAction}
      />
    </main>
  )
}
