import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { getAdminDream, getDreamCategories, getDreamOwners, updateDream } from "@/app/actions/dreams"

export const dynamic = "force-dynamic"

export default async function EditDreamPage({ params }: { params: { id: string } }) {
  const [{ dream }, { owners }, { categories }] = await Promise.all([
    getAdminDream(params.id),
    getDreamOwners(),
    getDreamCategories(true),
  ])

  if (!dream) notFound()

  async function updateDreamAction(formData: FormData) {
    "use server"
    await updateDream(params.id, formData)
  }

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col p-5 sm:p-8 lg:p-10">
      <Link href={`/admin/records/dreams/summary/${dream.id}`} className="mb-5 inline-flex h-10 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
        <ArrowLeft className="h-4 w-4" />
        Back to Dream
      </Link>

      <section className="overflow-hidden rounded-lg border border-amber-200 bg-[#fff9db] shadow-[0_20px_50px_-24px_rgba(120,80,0,0.4)]">
        <div className="flex h-10 items-center gap-2 border-b border-amber-200 bg-amber-100 px-5">
          <span className="h-3 w-3 rounded-full bg-rose-300" />
          <span className="h-3 w-3 rounded-full bg-amber-300" />
          <span className="h-3 w-3 rounded-full bg-emerald-300" />
          <p className="ml-2 text-xs font-extrabold uppercase tracking-widest text-amber-800">Edit Dream</p>
        </div>

        <form action={updateDreamAction} className="grid gap-5 bg-[linear-gradient(to_bottom,transparent_31px,rgba(245,158,11,0.18)_32px)] bg-[length:100%_32px] p-6 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-amber-950">
            Date
            <input name="dream_date" type="date" defaultValue={dream.dream_date} className="h-11 rounded-md border border-amber-200 bg-white/75 px-3 outline-none focus:border-amber-500" required />
          </label>

          <label className="grid gap-2 text-sm font-bold text-amber-950">
            Name or Reservation Number
            <select name="profile_id" className="h-11 rounded-md border border-amber-200 bg-white/75 px-3 outline-none focus:border-amber-500" required defaultValue={dream.profile_id}>
              {owners.map(owner => (
                <option key={owner.id} value={owner.id}>
                  {owner.full_name || "Unnamed member"} {owner.reservation_number ? `(${owner.reservation_number})` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold text-amber-950">
            Category
            <select name="category_id" className="h-11 rounded-md border border-amber-200 bg-white/75 px-3 outline-none focus:border-amber-500" defaultValue={dream.category_id || ""}>
              <option value="">No category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}{category.is_active ? "" : " (hidden)"}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold text-amber-950">
            Title
            <input name="title" defaultValue={dream.title} className="h-11 rounded-md border border-amber-200 bg-white/75 px-3 outline-none focus:border-amber-500" required />
          </label>

          <label className="grid gap-2 text-sm font-bold text-amber-950 lg:col-span-2">
            Dream
            <textarea name="body" rows={12} defaultValue={dream.body} className="resize-none rounded-md border border-amber-200 bg-white/75 px-3 py-2 leading-8 outline-none focus:border-amber-500" required />
          </label>

          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-black text-white shadow-sm hover:bg-slate-800 lg:col-span-2">
            <Save className="h-4 w-4" />
            Save Dream
          </button>
        </form>
      </section>
    </main>
  )
}
