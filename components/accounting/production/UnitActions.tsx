"use client"

import { useState } from "react"
import { Edit2, Loader2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteProductionUnit, updateProductionUnit } from "@/app/accounting/production/actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Unit = {
  id: string
  name: string
  short_name: string
  decimal_places: number
  active: boolean
}

export function UnitActions({ unit }: { unit: Unit }) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    try {
      const result = await updateProductionUnit(new FormData(event.currentTarget))
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Unit updated.")
        setEditOpen(false)
        router.refresh()
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setLoading(true)
    try {
      const result = await deleteProductionUnit(unit.id)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Unit deleted.")
        setDeleteOpen(false)
        router.refresh()
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogTrigger asChild>
          <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600" title="Edit unit">
            <Edit2 className="h-4 w-4" />
          </button>
        </DialogTrigger>
        <DialogContent className="w-[92vw] max-w-md rounded-2xl border-slate-200 bg-white p-0 text-slate-900 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 px-6 py-5 text-left">
            <DialogTitle className="text-xl font-extrabold text-slate-900">Edit Unit</DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500">Update unit details and status.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="grid gap-4 px-6 py-5">
            <input type="hidden" name="id" value={unit.id} />
            <label className="grid gap-1.5 text-sm font-bold text-slate-600">
              Unit name
              <input name="name" defaultValue={unit.name} required className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" />
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-slate-600">
              Short name
              <input name="short_name" defaultValue={unit.short_name} required className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" />
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-slate-600">
              Decimal places
              <input name="decimal_places" type="number" min="0" max="6" defaultValue={unit.decimal_places} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" />
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-slate-600">
              Status
              <select name="active" defaultValue={unit.active ? "true" : "false"} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
            <DialogFooter className="gap-3 pt-2 sm:space-x-0">
              <button type="button" onClick={() => setEditOpen(false)} disabled={loading} className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
                Cancel
              </button>
              <button disabled={loading} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-black text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit2 className="h-4 w-4" />}
                Save
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogTrigger asChild>
          <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600" title="Delete unit">
            <Trash2 className="h-4 w-4" />
          </button>
        </DialogTrigger>
        <DialogContent className="w-[92vw] max-w-md rounded-2xl border-slate-200 bg-white p-0 text-slate-900 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 px-6 py-5 text-left">
            <DialogTitle className="text-xl font-extrabold text-slate-900">Delete Unit?</DialogTitle>
            <DialogDescription className="text-sm font-medium leading-6 text-slate-500">
              This will mark <span className="font-extrabold text-slate-700">{unit.name}</span> as inactive.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 px-6 py-5 sm:space-x-0">
            <button type="button" onClick={() => setDeleteOpen(false)} disabled={loading} className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
              Cancel
            </button>
            <button type="button" onClick={handleDelete} disabled={loading} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-black text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
