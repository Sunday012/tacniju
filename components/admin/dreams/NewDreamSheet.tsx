"use client"

import { useState } from "react"
import { BookOpenText, CalendarDays, ChevronDown, X } from "lucide-react"

type Owner = { id: string; full_name: string | null; reservation_number: string | null }

export default function NewDreamSheet({ owners, action, embedded = false }: { owners: Owner[]; action: (formData: FormData) => void | Promise<void>; embedded?: boolean }) {
  const [open, setOpen] = useState(!embedded)

  return (
    <>
      {embedded ? (
        <button type="button" onClick={() => setOpen(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-black text-white shadow-sm hover:bg-indigo-700">
          <BookOpenText className="h-4 w-4" />
          New Dream
        </button>
      ) : (
        <main className="w-full flex-1 p-5 sm:p-8 lg:p-10"><div className="mx-auto max-w-5xl">
          <a href="/admin/records/dreams/summary" className="inline-flex h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm">Back to Dreams</a>
          <div className="mt-8 flex items-end justify-between border-b border-slate-200 pb-6"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">Dream Book</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">New Dream</h1><p className="mt-2 text-sm font-medium text-slate-500">Start a dream record, then add each scene under its own category.</p></div><button type="button" onClick={() => setOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-black text-white shadow-sm hover:bg-indigo-700">New Dream</button></div>
        </div></main>
      )}
      {open && <div className="fixed inset-0 z-50 bg-slate-950/45" role="dialog" aria-modal="true" aria-labelledby="new-dream-title"><div className="ml-auto flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5"><div><h2 id="new-dream-title" className="text-2xl font-black tracking-tight text-slate-950">New Dream</h2><p className="mt-1 text-sm font-medium text-slate-500">Add the record details before writing its scenes.</p></div><button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><X className="h-5 w-5" /></button></div>
        <form action={action} className="flex min-h-0 flex-1 flex-col"><div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
          <label className="grid gap-2 text-sm font-bold text-slate-800">Date<span className="relative"><input name="dream_date" type="date" required className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 pr-10 outline-none focus:border-indigo-500" /><CalendarDays className="pointer-events-none absolute right-3 top-3 h-5 w-5 text-slate-400" /></span></label>
          <label className="grid gap-2 text-sm font-bold text-slate-800">Name or Reservation Number<span className="relative"><select name="profile_id" required defaultValue="" className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-10 outline-none focus:border-indigo-500"><option value="" disabled>Select owner</option>{owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.full_name || "Unnamed member"}{owner.reservation_number ? ` (${owner.reservation_number})` : ""}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3 h-5 w-5 text-slate-400" /></span></label>
          <label className="grid gap-2 text-sm font-bold text-slate-800">Dream Title<input name="title" required placeholder="e.g. A call to preparation" className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-indigo-500" /></label>
        </div><div className="border-t border-slate-200 p-6"><button type="submit" className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-black text-white shadow-sm hover:bg-indigo-700">Continue to Dream Record</button></div></form>
      </div></div>}
    </>
  )
}
