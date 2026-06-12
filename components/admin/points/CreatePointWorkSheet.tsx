"use client"

import { useState } from "react"
import { Loader2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createPointWorkRecord } from "@/app/admin/points/actions"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type MemberOption = {
  id: string
  full_name: string | null
  points: number | null
}

export function CreatePointWorkSheet({
  category,
  categoryName,
  defaultMode,
  members,
}: {
  category: string
  categoryName: string
  defaultMode: "add" | "remove"
  members: MemberOption[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData(event.currentTarget)
      const result = await createPointWorkRecord(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Work created.")
        setOpen(false)
        router.refresh()
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-black text-white shadow-sm transition-colors hover:bg-indigo-700">
          <Plus className="h-4 w-4" />
          Create Work
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full border-slate-200 bg-white p-0 text-slate-900 sm:max-w-md">
        <SheetHeader className="border-b border-slate-100 px-6 py-5 text-left">
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Plus className="h-5 w-5" />
          </div>
          <SheetTitle className="text-xl font-extrabold text-slate-900">Create Work</SheetTitle>
          <SheetDescription className="text-sm font-medium text-slate-500">
            Add a {categoryName} point work entry.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 px-6 py-5">
          <input type="hidden" name="category" value={category} />
          <label className="grid gap-1.5 text-sm font-bold text-slate-600">
            Work title
            <input name="title" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" placeholder="Work title" required />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-600">
            Member
            <select name="profile_id" required className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white">
              <option value="">Select member</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.full_name || "Unnamed"} ({member.points || 0} pts)
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-bold text-slate-600">
              Points
              <input name="points" type="number" min="1" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" placeholder="10" required />
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-slate-600">
              Action
              <select name="mode" defaultValue={defaultMode} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white">
                <option value="add">Add</option>
                <option value="remove">Remove</option>
              </select>
            </label>
          </div>
          <label className="grid gap-1.5 text-sm font-bold text-slate-600">
            Note
            <textarea name="note" rows={3} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-indigo-300 focus:bg-white" placeholder="Optional note" />
          </label>
          <button disabled={loading} className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 font-black text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save Work
          </button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
