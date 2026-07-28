"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AlertTriangle, Eye, EyeOff, Loader2, Pencil, Trash2 } from "lucide-react"
import { deleteContentCategory, updateContentCategory, updateContentCategoryStatus } from "@/app/actions/content-records"
import type { ContentRecordType } from "@/lib/content-records"
import type { ContentCategory } from "@/app/actions/content-records"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function ContentCategoryActions({
  recordType,
  category,
  categories,
  groupOptions,
  isGroup = false,
}: {
  recordType: ContentRecordType
  category: ContentCategory
  categories: ContentCategory[]
  groupOptions?: ContentCategory[]
  isGroup?: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  function toggleStatus() {
    startTransition(async () => {
      const result = await updateContentCategoryStatus(recordType, category.id, !category.is_active)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(category.is_active ? "Category hidden" : "Category restored")
      router.refresh()
    })
  }

  function handleEdit(formData: FormData) {
    startTransition(async () => {
      const result = await updateContentCategory(recordType, category.id, formData)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Category updated")
      setIsEditing(false)
      router.refresh()
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteContentCategory(recordType, category.id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(isGroup ? "Group deleted" : "Category deleted")
      setIsDeleteOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        <Button type="button" variant="ghost" size="icon" onClick={() => setIsEditing(true)} disabled={isPending} className="h-8 w-8 text-slate-500 hover:text-indigo-600">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={toggleStatus} disabled={isPending} title={category.is_active ? "Hide category" : "Restore category"} className="h-8 w-8 text-slate-500">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : category.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => setIsDeleteOpen(true)} disabled={isPending} className="h-8 w-8 text-slate-500 hover:text-rose-600">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isGroup ? "Edit Group" : "Edit Category"}</DialogTitle>
          </DialogHeader>
          <form action={handleEdit} className="space-y-4">
            <input type="hidden" name="is_group" value={isGroup ? "true" : "false"} />
            <label className="grid gap-2 text-sm font-bold text-slate-600">
              Parent Group
              <select name="parent_id" defaultValue={category.parent_id || ""} disabled={isGroup} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60">
                <option value="">None (Top-Level Group)</option>
                {(groupOptions || categories.filter(item => item.parent_id === null && item.is_group)).filter(item => item.id !== category.id).map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-600">
              Name
              <input name="name" defaultValue={category.name} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" required />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-600">
              Description
              <textarea name="description" defaultValue={category.description || ""} rows={3} className="resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none focus:border-indigo-300 focus:bg-white" />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>{isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[440px] overflow-hidden border-0 p-0 shadow-2xl">
          <div className="border-b border-rose-100 bg-rose-50 px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm ring-1 ring-rose-100">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <DialogHeader className="space-y-1 text-left">
                <DialogTitle className="text-lg font-extrabold text-slate-950">
                  Delete {isGroup ? "group" : "category"}?
                </DialogTitle>
                <DialogDescription className="text-sm font-medium text-slate-600">
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <div className="space-y-4 px-6 py-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm font-black text-slate-900">{category.name}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {isGroup
                  ? "Categories under this group will move back to Unassigned."
                  : `Existing ${recordType} records using this category will become uncategorized.`}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-slate-100 bg-white px-6 py-4 sm:space-x-0">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isPending} className="h-10 font-bold">
              Cancel
            </Button>
            <Button type="button" onClick={handleDelete} disabled={isPending} className="h-10 bg-rose-600 font-bold text-white hover:bg-rose-700">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
