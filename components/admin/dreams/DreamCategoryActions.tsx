"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { updateDreamCategoryStatus } from "@/app/actions/dreams"
import { Button } from "@/components/ui/button"

export function DreamCategoryActions({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition()

  function toggleStatus() {
    startTransition(async () => {
      const result = await updateDreamCategoryStatus(id, !isActive)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success(isActive ? "Category hidden." : "Category restored.")
    })
  }

  return (
    <Button type="button" variant="outline" size="icon" onClick={toggleStatus} disabled={isPending} title={isActive ? "Hide category" : "Restore category"}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </Button>
  )
}
