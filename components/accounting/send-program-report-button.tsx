"use client"

import { useTransition } from "react"
import { Send } from "lucide-react"
import { toast } from "sonner"
import { sendProgramReportToHeadOffice } from "@/app/admin/office/admin-office/actions"
import { Button } from "@/components/ui/button"

export function SendProgramReportButton({ report }: { report: string }) {
  const [pending, startTransition] = useTransition()
  return <Button size="sm" disabled={pending} className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => startTransition(async () => {
    const result = await sendProgramReportToHeadOffice(report)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success("Report sent to Head Office.")
  })}><Send className="h-4 w-4" />{pending ? "Sending..." : "Send Report"}</Button>
}
