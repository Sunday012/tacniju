"use client"

import { useState } from "react"
import { Loader2, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updatePointWork } from "@/app/admin/points/actions"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function EditPointWorkSheet({
  work,
}: {
  work: {
    id: string
    title: string
    points: number
    mode: "add" | "remove"
    note?: string | null
  }
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData(event.currentTarget)
      const result = await updatePointWork(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Work updated.")
        setOpen(false)
        router.refresh()
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
          title="Edit work"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full border-slate-200 bg-white p-0 text-slate-900 sm:max-w-md">
        <SheetHeader className="border-b border-slate-100 px-6 py-5 text-left">
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Pencil className="h-5 w-5" />
          </div>
          <SheetTitle className="text-xl font-extrabold text-slate-900">Edit Work</SheetTitle>
          <SheetDescription className="text-sm font-medium text-slate-500">
            Changes to points or action will adjust existing members under this work.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 px-6 py-5">
          <input type="hidden" name="id" value={work.id} />
          <label className="grid gap-1.5 text-sm font-bold text-slate-600">
            Work title
            <input name="title" defaultValue={work.title} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" required />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-bold text-slate-600">
              Points
              <input name="points" type="number" min="1" defaultValue={work.points} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" required />
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-slate-600">
              Action
              <select name="mode" defaultValue={work.mode} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white">
                <option value="add">Add</option>
                <option value="remove">Remove</option>
              </select>
            </label>
          </div>
          <label className="grid gap-1.5 text-sm font-bold text-slate-600">
            Note
            <textarea name="note" rows={3} defaultValue={work.note || ""} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-indigo-300 focus:bg-white" />
          </label>
          <button disabled={loading} className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 font-black text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save Changes
          </button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
