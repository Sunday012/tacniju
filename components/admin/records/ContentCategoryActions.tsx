"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Eye, EyeOff, Loader2, Pencil, Trash2 } from "lucide-react"
import { deleteContentCategory, updateContentCategory, updateContentCategoryStatus } from "@/app/actions/content-records"
import type { ContentRecordType } from "@/lib/content-records"
import type { ContentCategory } from "@/app/actions/content-records"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function ContentCategoryActions({
  recordType,
  category,
  categories,
}: {
  recordType: ContentRecordType
  category: ContentCategory
  categories: ContentCategory[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)

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
    if (!confirm(`Delete "${category.name}"? Existing topics will become uncategorized.`)) return
    startTransition(async () => {
      const result = await deleteContentCategory(recordType, category.id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Category deleted")
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
        <Button type="button" variant="ghost" size="icon" onClick={handleDelete} disabled={isPending} className="h-8 w-8 text-slate-500 hover:text-rose-600">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form action={handleEdit} className="space-y-4">
            <label className="grid gap-2 text-sm font-bold text-slate-600">
              Parent Group
              <select name="parent_id" defaultValue={category.parent_id || ""} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white">
                <option value="">None (Top-Level Group)</option>
                {categories.filter(item => item.id !== category.id && item.parent_id === null).map(item => (
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
    </>
  )
}
