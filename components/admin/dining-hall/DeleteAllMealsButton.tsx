"use client"

import { useState } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteAllDiningHallMeals } from "@/app/admin/dining-hall/actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function DeleteAllMealsButton({ mealCount }: { mealCount: number }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const disabled = mealCount === 0 || loading

  async function handleDeleteAll() {
    setLoading(true)
    try {
      const result = await deleteAllDiningHallMeals()
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("All meals deleted from timetable.")
        setOpen(false)
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          disabled={mealCount === 0}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-black text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
        >
          <Trash2 className="h-4 w-4" />
          Delete All
        </button>
      </DialogTrigger>
      <DialogContent className="w-[92vw] max-w-md rounded-2xl border-slate-200 bg-white p-0 text-slate-900 shadow-2xl">
        <DialogHeader className="border-b border-slate-100 px-6 py-5 text-left">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <Trash2 className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl font-extrabold text-slate-900">Delete all meals?</DialogTitle>
          <DialogDescription className="text-sm font-medium leading-6 text-slate-500">
            This will remove all {mealCount} active meal{mealCount === 1 ? "" : "s"} from the timetable. Existing
            serving records will stay intact.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-3 px-6 py-5 sm:space-x-0">
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteAll}
            disabled={disabled}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-black text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete All Meals
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
