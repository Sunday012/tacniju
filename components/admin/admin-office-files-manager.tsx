"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check, CornerUpLeft, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { updateAdminOfficeFileStatus } from "@/app/admin/office/admin-office/actions"
import { Button } from "@/components/ui/button"

export type AdminOfficeFile = {
  id: string
  title: string
  description: string | null
  status: "New" | "Approved" | "Rejected" | "Sent Back"
  created_at: string
}

const statusStyles: Record<AdminOfficeFile["status"], string> = {
  New: "bg-blue-50 text-blue-700",
  Approved: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-rose-50 text-rose-700",
  "Sent Back": "bg-amber-50 text-amber-700",
}

export function AdminOfficeFilesManager({ files, allowReview = false }: { files: AdminOfficeFile[]; allowReview?: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const changeStatus = (id: string, status: AdminOfficeFile["status"]) => {
    startTransition(async () => {
      const result = await updateAdminOfficeFileStatus(id, status)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(status === "Sent Back" ? "File sent back." : `File ${status.toLowerCase()}.`)
      router.refresh()
    })
  }

  return (
    <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">File</th>
              <th className="px-4 py-3">Status</th>
              {allowReview && <th className="px-4 py-3 text-right">Review</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {files.map((file) => (
              <tr key={file.id}>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{new Date(file.created_at).toLocaleDateString("en-GB")}</td>
                <td className="px-4 py-3">
                  <p className="font-bold text-slate-900">{file.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{file.description || "-"}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-bold ${statusStyles[file.status]}`}>{file.status}</span>
                </td>
                {allowReview && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="outline" className="gap-2" disabled={isPending} onClick={() => changeStatus(file.id, "Approved")}>
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-emerald-600" />}
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2" disabled={isPending} onClick={() => changeStatus(file.id, "Rejected")}>
                        <X className="h-4 w-4 text-rose-600" />
                        Reject
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2" disabled={isPending} onClick={() => changeStatus(file.id, "Sent Back")}>
                        <CornerUpLeft className="h-4 w-4 text-amber-600" />
                        Send Back
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {!files.length && (
              <tr>
                <td colSpan={allowReview ? 4 : 3} className="px-4 py-12 text-center text-slate-400">No files in this section.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
