"use client"

import { useMemo, useState } from "react"
import { Plus, Save, Trash2 } from "lucide-react"

type Category = { id: string; name: string; is_active: boolean }
type Owner = { id: string; full_name: string | null; reservation_number: string | null }
type Scene = { category_id: string; body: string }
type Dream = { dream_date: string; title: string; profile_id: string; body: string; category_id: string | null; scenes?: Array<{ category_id: string | null; body: string }> }

export default function DreamRecordEditor({ dream, owners, categories, action }: { dream: Dream; owners: Owner[]; categories: Category[]; action: (formData: FormData) => void | Promise<void> }) {
  const initialScenes = useMemo<Scene[]>(() => dream.scenes?.length ? dream.scenes.map((scene) => ({ category_id: scene.category_id || "", body: scene.body })) : [{ category_id: dream.category_id || "", body: dream.body }], [dream])
  const [scenes, setScenes] = useState<Scene[]>(initialScenes)
  const updateScene = (index: number, field: keyof Scene, value: string) => setScenes((current) => current.map((scene, sceneIndex) => sceneIndex === index ? { ...scene, [field]: value } : scene))

  return <form action={action} className="space-y-6"><input type="hidden" name="scenes" value={JSON.stringify(scenes)} />
    <section className="grid gap-5 border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
      <label className="grid gap-2 text-sm font-bold text-slate-800">Date<input name="dream_date" type="date" defaultValue={dream.dream_date} required className="h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-indigo-500" /></label>
      <label className="grid gap-2 text-sm font-bold text-slate-800">Name or Reservation Number<select name="profile_id" defaultValue={dream.profile_id} required className="h-11 rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-indigo-500">{owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.full_name || "Unnamed member"}{owner.reservation_number ? ` (${owner.reservation_number})` : ""}</option>)}</select></label>
      <label className="grid gap-2 text-sm font-bold text-slate-800 sm:col-span-2 lg:col-span-1">Dream Title<input name="title" defaultValue={dream.title} required className="h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-indigo-500" /></label>
    </section>
    <section className="overflow-hidden border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4"><div><h2 className="text-xl font-black text-slate-950">Dream Scenes</h2><p className="mt-1 text-sm font-medium text-slate-500">{scenes.length} scene{scenes.length === 1 ? "" : "s"} in this record</p></div><button type="button" onClick={() => setScenes((current) => [...current, { category_id: "", body: "" }])} className="inline-flex h-10 items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 text-sm font-black text-indigo-700 hover:bg-indigo-50"><Plus className="h-4 w-4" />Add Scene</button></div>
      <div className="overflow-x-auto"><div className="min-w-[720px]"><div className="grid grid-cols-[220px_minmax(0,1fr)_70px] border-b border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-500"><span>Category</span><span>Scene</span><span /></div>{scenes.map((scene, index) => <div key={index} className="grid grid-cols-[220px_minmax(0,1fr)_70px] items-start gap-4 border-b border-slate-200 px-5 py-4 last:border-b-0"><select value={scene.category_id} onChange={(event) => updateScene(index, "category_id", event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-indigo-500"><option value="">No category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}{category.is_active ? "" : " (hidden)"}</option>)}</select><textarea value={scene.body} onChange={(event) => updateScene(index, "body", event.target.value)} rows={4} placeholder={`Write scene ${index + 1}...`} className="min-h-24 resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-indigo-500" /><button type="button" disabled={scenes.length === 1} onClick={() => setScenes((current) => current.filter((_, sceneIndex) => sceneIndex !== index))} aria-label={`Remove scene ${index + 1}`} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 className="h-4 w-4" /></button></div>)}</div></div>
      <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-4"><button type="submit" className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-black text-white shadow-sm hover:bg-indigo-700"><Save className="h-4 w-4" />Save Dream Record</button></div>
    </section>
  </form>
}
