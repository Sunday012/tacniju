"use client"

import { useState } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteProductionJournal } from "@/app/accounting/production/actions"

export function DeleteProductionJournalButton({ journalId }: { journalId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!window.confirm("Delete this journal permanently? This will also remove it from kitchen stock calculations.")) return

    setLoading(true)
    try {
      const result = await deleteProductionJournal(journalId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Journal deleted.")
        router.refresh()
      }
    } catch {
      toast.error("Could not delete journal.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleDelete}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-3 text-xs font-black text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      Delete
    </button>
  )
}
