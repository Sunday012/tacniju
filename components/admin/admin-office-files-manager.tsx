"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check, CornerUpLeft, Loader2, Pencil, Send, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { deleteAdminOfficeFile, sendApprovedFileToHeadOffice, updateAdminOfficeFile, updateAdminOfficeFileStatus } from "@/app/admin/office/admin-office/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"

export type AdminOfficeFile = {
  id: string
  title: string
  description: string | null
  status: "New" | "Approved" | "Rejected" | "Sent Back"
  file_type?: string
  submitted_from?: string | null
  created_at: string
}

const statusStyles: Record<AdminOfficeFile["status"], string> = {
  New: "bg-blue-50 text-blue-700",
  Approved: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-rose-50 text-rose-700",
  "Sent Back": "bg-amber-50 text-amber-700",
}

export function AdminOfficeFilesManager({ files, allowReview = false, allowSendToHeadOffice = false }: { files: AdminOfficeFile[]; allowReview?: boolean; allowSendToHeadOffice?: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState<AdminOfficeFile | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")

  const run = (action: () => Promise<{ error?: string | null; success?: boolean }>, success: string, done?: () => void) => {
    startTransition(async () => {
      const result = await action()
      if (result.error) {
        toast.error(result.error)
        return
      }
      done?.()
      toast.success(success)
      router.refresh()
    })
  }

  const openEdit = (file: AdminOfficeFile) => {
    setEditing(file)
    setEditTitle(file.title)
    setEditDescription(file.description || "")
  }

  return (
    <>
      <Sheet open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
          <SheetHeader className="border-b border-slate-200 px-6 py-5 text-left">
            <SheetTitle>Edit File</SheetTitle>
            <SheetDescription>Update the file title or its recorded content.</SheetDescription>
          </SheetHeader>
          <div className="space-y-5 p-6">
            <label className="grid gap-2"><Label>Title</Label><Input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} /></label>
            <label className="grid gap-2"><Label>Content</Label><Textarea rows={10} value={editDescription} onChange={(event) => setEditDescription(event.target.value)} /></label>
            <Button onClick={() => editing && run(() => updateAdminOfficeFile(editing.id, editTitle, editDescription), "File updated.", () => setEditing(null))} disabled={isPending || !editTitle.trim()} className="h-11 w-full gap-2 bg-indigo-600 font-bold text-white hover:bg-indigo-700">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}Save Changes
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3">Created</th><th className="px-4 py-3">File</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {files.map((file) => (
                <tr key={file.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{new Date(file.created_at).toLocaleDateString("en-GB")}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900">{file.title}</p>
                    {((file.file_type && file.file_type !== "General") || file.submitted_from) && <p className="mt-0.5 text-xs font-semibold text-indigo-700">{file.file_type || "File"}{file.submitted_from ? ` from ${file.submitted_from}` : ""}</p>}
                    <p className="mt-0.5 whitespace-pre-wrap text-xs text-slate-500">{file.description || "-"}</p>
                  </td>
                  <td className="px-4 py-3"><span className={`inline-flex px-2 py-1 text-xs font-bold ${statusStyles[file.status]}`}>{file.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1">
                      {allowReview && <>
                        <Button size="sm" variant="outline" className="gap-2" disabled={isPending} onClick={() => run(() => updateAdminOfficeFileStatus(file.id, "Approved"), "File approved.")}><Check className="h-4 w-4 text-emerald-600" />Approve</Button>
                        <Button size="sm" variant="outline" className="gap-2" disabled={isPending} onClick={() => run(() => updateAdminOfficeFileStatus(file.id, "Rejected"), "File rejected.")}><X className="h-4 w-4 text-rose-600" />Reject</Button>
                        <Button size="sm" variant="outline" className="gap-2" disabled={isPending} onClick={() => run(() => updateAdminOfficeFileStatus(file.id, "Sent Back"), "File sent back.")}><CornerUpLeft className="h-4 w-4 text-amber-600" />Send Back</Button>
                      </>}
                      {allowSendToHeadOffice && <Button size="sm" className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700" disabled={isPending} onClick={() => run(() => sendApprovedFileToHeadOffice(file.id), "File sent to Head Office for final approval.")}><Send className="h-4 w-4" />Send to Head Office</Button>}
                      <Button size="icon" variant="outline" aria-label={`Edit ${file.title}`} title="Edit file" disabled={isPending} onClick={() => openEdit(file)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="outline" aria-label={`Delete ${file.title}`} title="Delete file" disabled={isPending} className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => confirm(`Permanently delete "${file.title}"?`) && run(() => deleteAdminOfficeFile(file.id), "File deleted.")}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!files.length && <tr><td colSpan={4} className="px-4 py-12 text-center text-slate-400">No files in this section.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
