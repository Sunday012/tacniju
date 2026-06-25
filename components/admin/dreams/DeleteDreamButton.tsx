"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Trash2 } from "lucide-react"
import { deleteDream } from "@/app/actions/dreams"
import { Button } from "@/components/ui/button"

export function DeleteDreamButton({ dreamId, title }: { dreamId: string; title: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    if (!window.confirm(`Delete "${title}"?`)) return

    startTransition(async () => {
      const result = await deleteDream(dreamId)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Dream deleted.")
      router.push("/admin/records/dreams/summary")
    })
  }

  return (
    <Button type="button" variant="outline" onClick={handleDelete} disabled={isPending} className="gap-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700">
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      Delete
    </Button>
  )
}
