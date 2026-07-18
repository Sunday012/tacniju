"use client"

import { useState, useTransition } from "react"
import { SlidersHorizontal } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { adjustLedgerBalance, type LedgerBalance } from "@/app/management/actions"
import { useRouter } from "next/navigation"

function formatBalance(balance?: LedgerBalance | null) {
  if (!balance) return "NGN 0.00"
  return `NGN ${balance.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${balance.type}`
}

export function AdjustBalanceDialog({ ledgerId, ledgerName, balance }: { ledgerId: string; ledgerName: string; balance?: LedgerBalance | null }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [adjustmentType, setAdjustmentType] = useState<"add" | "reduce">("add")
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [isPending, startTransition] = useTransition()
  const signed = (balance?.type === "Cr" ? -1 : 1) * Number(balance?.amount || 0)
  const nextSigned = signed + (adjustmentType === "add" ? Number(amount || 0) : -Number(amount || 0))

  function submit() {
    startTransition(async () => {
      const result = await adjustLedgerBalance(ledgerId, { adjustmentType, amount: Number(amount || 0), note })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Balance adjusted")
      setOpen(false)
      setAmount("")
      setNote("")
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="h-10 gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Adjust Balance
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Balance</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-500">{ledgerName}</p>
          <div>
            <Label>Adjustment Type</Label>
            <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button type="button" onClick={() => setAdjustmentType("add")} className={`h-10 rounded-lg text-sm font-black ${adjustmentType === "add" ? "bg-emerald-500 text-white" : "text-slate-500"}`}>+ Add Balance</button>
              <button type="button" onClick={() => setAdjustmentType("reduce")} className={`h-10 rounded-lg text-sm font-black ${adjustmentType === "reduce" ? "bg-slate-900 text-white dark:bg-slate-950" : "text-slate-500"}`}>- Reduce Balance</button>
            </div>
          </div>
          <Input type="number" min="0" step="0.01" value={amount} onChange={event => setAmount(event.target.value)} placeholder="Amount" />
          <Input value={note} onChange={event => setNote(event.target.value)} placeholder="Note or remarks" />
          <div className="rounded-xl bg-slate-100 p-4 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <div className="flex justify-between"><span>Current Balance:</span><span>{formatBalance(balance)}</span></div>
            <div className="mt-2 flex justify-between"><span>Adjusted Balance:</span><span>NGN {Math.abs(nextSigned).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {nextSigned < 0 ? "Cr" : "Dr"}</span></div>
          </div>
          <Button onClick={submit} disabled={isPending} className="h-11 w-full bg-emerald-500 font-black text-white hover:bg-emerald-600">
            Confirm Adjustment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
