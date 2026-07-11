import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getContentCategories, getContentOwners, getContentRecord, updateContentRecord, requireContentRecordType } from "@/app/actions/content-records"
import { contentRecordLabels } from "@/lib/content-records"

export const dynamic = "force-dynamic"

export default async function EditContentRecordPage({ params }: { params: { kind: string; id: string } }) {
  const kind = await requireContentRecordType(params.kind)
  const labels = contentRecordLabels[kind]
  const [{ record }, { categories }, { owners }] = await Promise.all([
    getContentRecord(kind, params.id),
    getContentCategories(kind),
    getContentOwners(),
  ])

  if (!record) notFound()

  async function updateAction(formData: FormData) {
    "use server"
    await updateContentRecord(kind, params.id, formData)
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 p-5 sm:p-8 lg:p-10">
      <Link href={`/admin/records/${kind}/summary`} className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
        <ArrowLeft className="h-4 w-4" />
        Back to Summary
      </Link>
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-900">Edit {labels.singular}</h1>

      <form action={updateAction} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-bold text-slate-700">
            Date
            <input name="record_date" type="date" required defaultValue={record.record_date} className="h-11 w-full rounded-xl border border-slate-200 px-3 font-semibold outline-none focus:border-indigo-400" />
          </label>
          <label className="space-y-1.5 text-sm font-bold text-slate-700">
            Category
            <select name="category_id" defaultValue={record.category_id || ""} className="h-11 w-full rounded-xl border border-slate-200 px-3 font-semibold outline-none focus:border-indigo-400">
              <option value="">Uncategorized</option>
              {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label className="space-y-1.5 text-sm font-bold text-slate-700 sm:col-span-2">
            {labels.owner}
            <select name="profile_id" defaultValue={record.profile_id || ""} className="h-11 w-full rounded-xl border border-slate-200 px-3 font-semibold outline-none focus:border-indigo-400">
              <option value="">Not assigned</option>
              {owners.map(owner => owner && <option key={owner.id} value={owner.id}>{owner.full_name || "Unnamed Member"}</option>)}
            </select>
          </label>
        </div>
        <label className="block space-y-1.5 text-sm font-bold text-slate-700">
          Title
          <input name="title" required defaultValue={record.title} className="h-11 w-full rounded-xl border border-slate-200 px-3 font-semibold outline-none focus:border-indigo-400" />
        </label>
        <label className="block space-y-1.5 text-sm font-bold text-slate-700">
          Details
          <textarea name="body" required rows={14} defaultValue={record.body} className="w-full rounded-xl border border-slate-200 px-3 py-3 font-medium outline-none focus:border-indigo-400" />
        </label>
        <div className="flex justify-end">
          <button className="h-11 rounded-xl bg-indigo-600 px-5 text-sm font-black text-white hover:bg-indigo-700">Save Changes</button>
        </div>
      </form>
    </main>
  )
}
