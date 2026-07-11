"use client"

import { useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { setPresentationState } from "@/app/actions/presentation"
import { deleteContentRecord } from "@/app/actions/content-records"
import type { ContentRecordType } from "@/lib/content-records"

export function ContentRecordActions({
  recordType,
  recordId,
  title,
  body,
}: {
  recordType: ContentRecordType
  recordId: string
  title: string
  body: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function projectRecord() {
    startTransition(async () => {
      const result = await setPresentationState(true, recordType === "lyrics" ? "lyrics" : "text", {
        title,
        text: body,
        label: recordType === "lyrics" ? "Lyrics" : "Record",
      })
      if (result.error) toast.error(result.error)
      else toast.success(recordType === "lyrics" ? "Lyrics sent to projection" : "Record sent to projection")
    })
  }

  function removeRecord() {
    if (!confirm(`Delete "${title}"?`)) return
    startTransition(async () => {
      const result = await deleteContentRecord(recordType, recordId)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Record deleted")
      router.refresh()
    })
  }

  return (
    <div className="flex justify-end gap-1">
      <button
        type="button"
        onClick={projectRecord}
        disabled={isPending}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
        title="Show on projection"
      >
        <Eye className="h-4 w-4" />
      </button>
      <Link
        href={`/admin/records/${recordType}/${recordId}/edit`}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
        title="Edit record"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        type="button"
        onClick={removeRecord}
        disabled={isPending}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
        title="Delete record"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
