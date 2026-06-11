"use client"

import { useState } from "react"
import { Loader2, Undo2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteDiningHallServing } from "@/app/admin/dining-hall/actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function RemoveServingButton({ servingId, personName }: { servingId: string; personName: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleRemove() {
    setLoading(true)
    try {
      const result = await deleteDiningHallServing(servingId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Food record removed.")
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-black text-rose-700 transition-colors hover:bg-rose-100"
        >
          <Undo2 className="h-3.5 w-3.5" />
          Remove
        </button>
      </DialogTrigger>
      <DialogContent className="w-[92vw] max-w-md rounded-2xl border-slate-200 bg-white p-0 text-slate-900 shadow-2xl">
        <DialogHeader className="border-b border-slate-100 px-6 py-5 text-left">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <Undo2 className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl font-extrabold text-slate-900">Remove food record?</DialogTitle>
          <DialogDescription className="text-sm font-medium leading-6 text-slate-500">
            This will remove the latest recorded food entry for{" "}
            <span className="font-extrabold text-slate-700">{personName || "this person"}</span>.
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
            onClick={handleRemove}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-black text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Undo2 className="h-4 w-4" />}
            Remove Record
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
