"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { submitDirectorProgramProposal } from "@/app/admin/office/admin-office/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function ProgramProposalManager({ director }: { director: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState("")
  const [eventName, setEventName] = useState("")
  const [memo, setMemo] = useState("")
  const recipient = "Secretaries"

  const submit = () => {
    const formData = new FormData()
    formData.set("director", director)
    formData.set("title", title)
    formData.set("event_name", eventName)
    formData.set("memo", memo)
    formData.set("recipient", recipient)
    startTransition(async () => {
      const result = await submitDirectorProgramProposal(formData)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(`Program proposal sent to ${recipient}.`)
      setTitle("")
      setEventName("")
      setMemo("")
      router.refresh()
    })
  }

  return <section className="border border-slate-200 bg-white shadow-sm"><header className="border-b border-slate-200 px-5 py-4"><h2 className="font-extrabold text-slate-900">Program Proposal Memo</h2><p className="mt-1 text-sm text-slate-500">Send this proposal to the Secretariat for review.</p></header><div className="space-y-5 p-5"><div className="grid gap-4 md:grid-cols-2"><label className="grid gap-1.5"><Label>Director</Label><Input value={`${director} Director`} disabled /></label><label className="grid gap-1.5"><Label>Recipient</Label><Input value="Secretariat" disabled /></label></div><label className="grid gap-1.5"><Label>Program or Proposal Title</Label><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Rehearsal and Service Plan" /></label><label className="grid gap-1.5"><Label>Event</Label><Input value={eventName} onChange={(event) => setEventName(event.target.value)} placeholder="Event this proposal is for" /></label><label className="grid gap-1.5"><Label>Memo</Label><Textarea rows={14} value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="Write the full proposal memo..." /></label><div className="flex justify-end"><Button disabled={isPending} onClick={submit}>{isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Send Proposal</Button></div></div></section>
}
