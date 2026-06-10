"use client"

import { useState } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteDiningHallMeal } from "@/app/admin/dining-hall/actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function DeleteMealButton({ mealId, mealName }: { mealId: string; mealName: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      const result = await deleteDiningHallMeal(mealId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Meal deleted from timetable.")
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
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
          title="Delete meal"
          aria-label={`Delete ${mealName || "meal"}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="w-[92vw] max-w-md rounded-2xl border-slate-200 bg-white p-0 text-slate-900 shadow-2xl">
        <DialogHeader className="border-b border-slate-100 px-6 py-5 text-left">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <Trash2 className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl font-extrabold text-slate-900">Delete meal?</DialogTitle>
          <DialogDescription className="text-sm font-medium leading-6 text-slate-500">
            This will remove <span className="font-extrabold text-slate-700">{mealName || "this meal"}</span> from the
            active timetable. Existing serving records will stay intact.
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
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-black text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete Meal
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
