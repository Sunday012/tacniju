"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateContentCategoryStatus } from "@/app/actions/content-records"
import type { ContentRecordType } from "@/lib/content-records"

export function ContentCategoryActions({
  recordType,
  categoryId,
  isActive,
}: {
  recordType: ContentRecordType
  categoryId: string
  isActive: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await updateContentCategoryStatus(recordType, categoryId, !isActive)
          if (result.error) {
            toast.error(result.error)
            return
          }
          toast.success(isActive ? "Category hidden" : "Category restored")
          router.refresh()
        })
      }}
      className={`rounded-lg px-3 py-1.5 text-xs font-black ${isActive ? "bg-red-50 text-red-700 hover:bg-red-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}
    >
      {isActive ? "Hide" : "Restore"}
    </button>
  )
}
