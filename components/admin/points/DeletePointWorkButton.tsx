"use client"

import { useState } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deletePointWorkRecord } from "@/app/admin/points/actions"

export function DeletePointWorkButton({ recordId }: { recordId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!window.confirm("Delete this work entry and reverse its points?")) return

    setLoading(true)
    try {
      const result = await deletePointWorkRecord(recordId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Work deleted.")
        router.refresh()
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
      title="Delete work"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  )
}
