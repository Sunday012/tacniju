"use client"

import { useState } from "react"
import { Edit2, EyeOff, Loader2, Power, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteProductionCategory, setProductionCategoryActive, updateProductionCategory } from "@/app/accounting/production/actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Category = {
  id: string
  name: string
  description: string | null
  tracking_number: string | null
  active: boolean
}

export function CategoryActions({ category }: { category: Category }) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    try {
      const result = await updateProductionCategory(new FormData(event.currentTarget))
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Category updated.")
        setEditOpen(false)
        router.refresh()
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange() {
    setLoading(true)
    try {
      const result = await setProductionCategoryActive(category.id, !category.active)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(category.active ? "Category marked inactive." : "Category activated.")
        setStatusOpen(false)
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
      const result = await deleteProductionCategory(category.id)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Category deleted forever.")
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
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
            title="Edit category"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        </DialogTrigger>
        <DialogContent className="w-[92vw] max-w-md rounded-2xl border-slate-200 bg-white p-0 text-slate-900 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 px-6 py-5 text-left">
            <DialogTitle className="text-xl font-extrabold text-slate-900">Edit Category</DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500">
              Update category details and status.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="grid gap-4 px-6 py-5">
            <input type="hidden" name="id" value={category.id} />
            <label className="grid gap-1.5 text-sm font-bold text-slate-600">
              Category name
              <input name="name" defaultValue={category.name} required className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" />
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-slate-600">
              Description
              <input name="description" defaultValue={category.description || ""} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" />
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-slate-600">
              Stock group tracking number
              <input name="tracking_number" defaultValue={category.tracking_number || ""} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono outline-none focus:border-indigo-300 focus:bg-white" placeholder="SGR-00001" />
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-slate-600">
              Status
              <select name="active" defaultValue={category.active ? "true" : "false"} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
            <DialogFooter className="gap-3 pt-2 sm:space-x-0">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                disabled={loading}
                className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-black text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit2 className="h-4 w-4" />}
                Save
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600"
            title={category.active ? "Make inactive" : "Activate category"}
          >
            {category.active ? <EyeOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
          </button>
        </DialogTrigger>
        <DialogContent className="w-[92vw] max-w-md rounded-2xl border-slate-200 bg-white p-0 text-slate-900 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 px-6 py-5 text-left">
            <DialogTitle className="text-xl font-extrabold text-slate-900">
              {category.active ? "Make Category Inactive?" : "Activate Category?"}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium leading-6 text-slate-500">
              {category.active
                ? `This will hide ${category.name} for now without deleting it.`
                : `This will make ${category.name} available again.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 px-6 py-5 sm:space-x-0">
            <button
              type="button"
              onClick={() => setStatusOpen(false)}
              disabled={loading}
              className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStatusChange}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 text-sm font-black text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : category.active ? <EyeOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
              {category.active ? "Make Inactive" : "Activate"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
            title="Delete category"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </DialogTrigger>
        <DialogContent className="w-[92vw] max-w-md rounded-2xl border-slate-200 bg-white p-0 text-slate-900 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 px-6 py-5 text-left">
            <DialogTitle className="text-xl font-extrabold text-slate-900">Delete Category?</DialogTitle>
            <DialogDescription className="text-sm font-medium leading-6 text-slate-500">
              This will permanently delete <span className="font-extrabold text-slate-700">{category.name}</span>. Use the inactive button if you only want to hide it for now.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 px-6 py-5 sm:space-x-0">
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              disabled={loading}
              className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-black text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
