import Link from "next/link"
import { ArrowLeft, Send } from "lucide-react"
import { createDream, getDreamCategories, getDreamOwners } from "@/app/actions/dreams"

export const dynamic = "force-dynamic"

export default async function NewDreamPage() {
  const [{ owners }, { categories }] = await Promise.all([
    getDreamOwners(),
    getDreamCategories(),
  ])

  async function createDreamAction(formData: FormData) {
    "use server"
    await createDream(formData)
  }

  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-[1600px] mx-auto w-full">
      <Link href="/admin/records/dreams" className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
        <ArrowLeft className="h-4 w-4" />
        Back to Dreams
      </Link>

      <div className="grid gap-8 xl:grid-cols-[minmax(340px,460px)_1fr]">
        <section className="bg-[#fff9db] border border-amber-200 shadow-[0_20px_50px_-24px_rgba(120,80,0,0.4)] rounded-lg overflow-hidden">
          <div className="h-10 bg-amber-100 border-b border-amber-200 flex items-center px-5 gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-300" />
            <span className="h-3 w-3 rounded-full bg-amber-300" />
            <span className="h-3 w-3 rounded-full bg-emerald-300" />
            <p className="ml-2 text-xs font-extrabold uppercase tracking-widest text-amber-800">Dream Note</p>
          </div>

          <form action={createDreamAction} className="space-y-5 p-6 bg-[linear-gradient(to_bottom,transparent_31px,rgba(245,158,11,0.18)_32px)] bg-[length:100%_32px]">
            <label className="grid gap-2 text-sm font-bold text-amber-950">
              Date
              <input name="dream_date" type="date" className="h-11 rounded-md border border-amber-200 bg-white/75 px-3 outline-none focus:border-amber-500" required />
            </label>

            <label className="grid gap-2 text-sm font-bold text-amber-950">
              Name or Reservation Number
              <select name="profile_id" className="h-11 rounded-md border border-amber-200 bg-white/75 px-3 outline-none focus:border-amber-500" required defaultValue="">
                <option value="" disabled>Select owner</option>
                {owners.map(owner => (
                  <option key={owner.id} value={owner.id}>
                    {owner.full_name || "Unnamed member"} {owner.reservation_number ? `(${owner.reservation_number})` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold text-amber-950">
              Category
              <select name="category_id" className="h-11 rounded-md border border-amber-200 bg-white/75 px-3 outline-none focus:border-amber-500" defaultValue="">
                <option value="">No category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold text-amber-950">
              Title
              <input name="title" className="h-11 rounded-md border border-amber-200 bg-white/75 px-3 outline-none focus:border-amber-500" placeholder="Dream title" required />
            </label>

            <label className="grid gap-2 text-sm font-bold text-amber-950">
              Dream
              <textarea name="body" rows={10} className="resize-none rounded-md border border-amber-200 bg-white/75 px-3 py-2 leading-8 outline-none focus:border-amber-500" placeholder="Document the dream..." required />
            </label>

            <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-black text-white shadow-sm hover:bg-slate-800">
              <Send className="h-4 w-4" />
              Save Dream
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white/85 p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">New Dream</h1>
          <p className="mt-2 text-sm font-medium leading-7 text-slate-500">
            Each dream is stored by date and attached to the selected member, so the member can see only their own dream records from the dashboard.
          </p>
        </section>
      </div>
    </main>
  )
}
