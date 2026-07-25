"use client"

import { useTransition, useState, useRef } from "react"
import { toast } from "sonner"
import { Eye, EyeOff, Loader2, Pencil, Trash2 } from "lucide-react"
import { updateDreamCategoryStatus, updateDreamCategory, deleteDreamCategory } from "@/app/actions/dreams"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function DreamCategoryActions({
  category,
  categories,
}: {
  category: { id: string; parent_id: string | null; name: string; description: string | null; is_active: boolean }
  categories: Array<{ id: string; name: string }>
}) {
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  function toggleStatus() {
    startTransition(async () => {
      const result = await updateDreamCategoryStatus(category.id, !category.is_active)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success(category.is_active ? "Category hidden." : "Category restored.")
    })
  }

  function handleEdit(formData: FormData) {
    startTransition(async () => {
      const result = await updateDreamCategory(category.id, formData)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Category updated.")
      setIsEditing(false)
    })
  }

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this category?")) return
    startTransition(async () => {
      const result = await deleteDreamCategory(category.id)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Category deleted.")
    })
  }

  return (
    <>
      <div className="flex items-center gap-1.5 shrink-0">
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
          <form action={handleEdit} ref={formRef} className="space-y-4">
            <label className="grid gap-2 text-sm font-bold text-slate-600">
              Category
              <select name="parent_id" defaultValue={category.parent_id || ""} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white">
                <option value="">Create as category</option>
                {categories.filter(item => item.id !== category.id).map(item => (
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
