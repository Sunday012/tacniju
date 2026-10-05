"use client"

import { useTransition } from "react"
import { Send } from "lucide-react"
import { toast } from "sonner"
import { sendFinanceRecordsReportToHeadOffice } from "@/app/admin/office/admin-office/actions"
import { Button } from "@/components/ui/button"

export function SendFinanceRecordsReportButton({ period, date, label }: { period: string; date: string; label: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <Button
      variant="outline"
      className="border-slate-300 bg-white font-bold text-slate-900 shadow-sm hover:border-indigo-300 hover:bg-indigo-50"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await sendFinanceRecordsReportToHeadOffice(period, date, label)
          if (result.error) {
            toast.error(result.error)
            return
          }
          toast.success("Finance report sent to Head Office.")
        })
      }
    >
      <Send className="mr-2 h-4 w-4" />
      {pending ? "Sending..." : "Send Report"}
    </Button>
  )
}
