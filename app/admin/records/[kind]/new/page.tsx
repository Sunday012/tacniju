import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createContentRecord, getContentCategories, getContentOwners, requireContentRecordType } from "@/app/actions/content-records"
import { contentRecordLabels } from "@/lib/content-records"

export const dynamic = "force-dynamic"

export default async function NewContentRecordPage({ params }: { params: { kind: string } }) {
  const kind = await requireContentRecordType(params.kind)
  const labels = contentRecordLabels[kind]
  const [{ categories }, { owners }] = await Promise.all([getContentCategories(kind), getContentOwners()])

  async function createAction(formData: FormData) {
    "use server"
    await createContentRecord(kind, formData)
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 p-5 sm:p-8 lg:p-10">
      <Link href={`/admin/records/${kind}`} className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
        <ArrowLeft className="h-4 w-4" />
        Back to {labels.plural}
      </Link>
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-900">New {labels.singular}</h1>

      <form action={createAction} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-bold text-slate-700">
            Date
            <input name="record_date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="h-11 w-full rounded-xl border border-slate-200 px-3 font-semibold outline-none focus:border-indigo-400" />
          </label>
          <label className="space-y-1.5 text-sm font-bold text-slate-700">
            Category
            <select name="category_id" className="h-11 w-full rounded-xl border border-slate-200 px-3 font-semibold outline-none focus:border-indigo-400">
              <option value="">Uncategorized</option>
              {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label className="space-y-1.5 text-sm font-bold text-slate-700 sm:col-span-2">
            {labels.owner}
            <select name="profile_id" className="h-11 w-full rounded-xl border border-slate-200 px-3 font-semibold outline-none focus:border-indigo-400">
              <option value="">Not assigned</option>
              {owners.map(owner => owner && <option key={owner.id} value={owner.id}>{owner.full_name || "Unnamed Member"}</option>)}
            </select>
          </label>
        </div>
        <label className="block space-y-1.5 text-sm font-bold text-slate-700">
          Title
          <input name="title" required className="h-11 w-full rounded-xl border border-slate-200 px-3 font-semibold outline-none focus:border-indigo-400" />
        </label>
        <label className="block space-y-1.5 text-sm font-bold text-slate-700">
          Details
          <textarea name="body" required rows={14} className="w-full rounded-xl border border-slate-200 px-3 py-3 font-medium outline-none focus:border-indigo-400" />
        </label>
        <div className="flex justify-end">
          <button className="h-11 rounded-xl bg-indigo-600 px-5 text-sm font-black text-white hover:bg-indigo-700">Save {labels.singular}</button>
        </div>
      </form>
    </main>
  )
}
