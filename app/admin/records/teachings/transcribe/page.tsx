import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getContentCategories, getContentOwners } from "@/app/actions/content-records"
import { TeachingTranscriber } from "./TeachingTranscriber"

export const dynamic = "force-dynamic"

export default async function TeachingTranscribePage() {
  const [{ categories, error: categoriesError }, { owners, error: ownersError }] = await Promise.all([
    getContentCategories("teachings", true),
    getContentOwners(),
  ])
  const error = categoriesError || ownersError

  return (
    <main className="w-full flex-1 p-5 sm:p-8 lg:p-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin/records/teachings" className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
            Back to Teachings
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Transcribe Teaching</h1>
          <p className="mt-2 font-medium text-slate-500">Create a teaching record from multiple voice notes.</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          Run `scripts/044_create_content_records.sql` and `scripts/048_category_group_flags.sql` in Supabase.
        </div>
      )}

      <TeachingTranscriber categories={categories} owners={owners} />
    </main>
  )
}
