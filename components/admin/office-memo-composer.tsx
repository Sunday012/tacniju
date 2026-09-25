"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { FileText, Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { submitAdminOfficeMemo } from "@/app/admin/office/admin-office/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"

type MemoType = "Memo" | "Meeting Note" | "Invitation Letter" | "Received Letter" | "Transport Report"

export function OfficeMemoComposer({ fileType, submittedFrom, defaultRecipient = "Secretaries", allowRecipientChoice = false }: { fileType: MemoType; submittedFrom: string; defaultRecipient?: "Secretaries" | "Finance Officer"; allowRecipientChoice?: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [recipient, setRecipient] = useState(defaultRecipient)

  const submit = () => {
    const formData = new FormData()
    formData.set("title", title)
    formData.set("subject", subject)
    formData.set("body", body)
    formData.set("file_type", fileType)
    formData.set("submitted_from", submittedFrom)
    formData.set("recipient", recipient)
    startTransition(async () => {
      const result = await submitAdminOfficeMemo(formData)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(`${fileType} sent to ${recipient}.`)
      setTitle("")
      setSubject("")
      setBody("")
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="bg-indigo-600 font-bold text-white hover:bg-indigo-700"><FileText className="mr-2 h-4 w-4" />Create {fileType}</Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-slate-200 px-6 py-5 text-left">
          <SheetTitle>Create {fileType}</SheetTitle>
          <SheetDescription>Complete the document and send it to the appropriate office queue.</SheetDescription>
        </SheetHeader>
        <div className="space-y-5 p-6">
          {allowRecipientChoice && <label className="grid gap-1.5"><Label>Recipient</Label><Select value={recipient} onValueChange={(value) => setRecipient(value as "Secretaries" | "Finance Officer")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Secretaries">Secretariat</SelectItem><SelectItem value="Finance Officer">Financial Secretary</SelectItem></SelectContent></Select></label>}
          <label className="grid gap-1.5"><Label>Title</Label><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={`${fileType} title`} /></label>
          <label className="grid gap-1.5"><Label>Subject</Label><Input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Document subject or event" /></label>
          <label className="grid gap-1.5"><Label>Content</Label><Textarea rows={18} value={body} onChange={(event) => setBody(event.target.value)} placeholder={`Write the ${fileType.toLowerCase()} here...`} /></label>
          <Button className="w-full bg-indigo-600 font-bold text-white hover:bg-indigo-700" disabled={isPending || !title.trim() || !body.trim()} onClick={submit}>{isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Send Document</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
