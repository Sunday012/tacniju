"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { createBudgetSheet, deleteBudgetSheet, type BudgetSheet } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Program = { id: string; name: string }

export function BudgetListManager({ sheets, programs, type }: { sheets: BudgetSheet[]; programs: Program[]; type?: "Monthly" | "Program" }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [budgetType, setBudgetType] = useState<"Monthly" | "Program">(type || "Monthly")
  const [title, setTitle] = useState("")
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [programId, setProgramId] = useState("")

  const create = () => {
    const formData = new FormData()
    formData.set("budget_type", budgetType)
    formData.set("title", title || (budgetType === "Monthly" ? `Monthly Budget - ${month}` : "Program Budget"))
    formData.set("budget_month", month)
    formData.set("program_id", programId)
    startTransition(async () => {
      const result = await createBudgetSheet(formData)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Budget created.")
      router.push(`/accounting/programs/budget/${result.id}`)
    })
  }

  const remove = (id: string) => {
    if (!confirm("Delete this budget and all of its groups and items?")) return
    startTransition(async () => {
      const result = await deleteBudgetSheet(id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Budget deleted.")
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <section className="border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-extrabold text-slate-900">Create Budget</h2></div>
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
          {!type && <label className="grid gap-1.5"><Label>Budget Type</Label><Select value={budgetType} onValueChange={(value) => setBudgetType(value as "Monthly" | "Program")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Monthly">Monthly Budget</SelectItem><SelectItem value="Program">Program Budget</SelectItem></SelectContent></Select></label>}
          {budgetType === "Monthly" ? <label className="grid gap-1.5"><Label>Month</Label><Input type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></label> : <label className="grid gap-1.5"><Label>Program</Label><Select value={programId} onValueChange={setProgramId}><SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger><SelectContent>{programs.map((program) => <SelectItem key={program.id} value={program.id}>{program.name}</SelectItem>)}</SelectContent></Select></label>}
          <label className="grid gap-1.5 md:col-span-2"><Label>Budget Title</Label><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={budgetType === "Monthly" ? "Monthly Budget" : "Program Budget"} /></label>
          <Button className="self-end" disabled={isPending || (budgetType === "Program" && !programId)} onClick={create}>{isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}Create Budget</Button>
        </div>
      </section>

      <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Budget</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Program / Month</th><th className="px-5 py-3">Created</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {sheets.map((sheet) => <tr key={sheet.id}><td className="px-5 py-4"><Link href={`/accounting/programs/budget/${sheet.id}`} className="font-bold text-slate-900 hover:text-indigo-700">{sheet.title}</Link></td><td className="px-5 py-4 text-slate-600">{sheet.budget_type}</td><td className="px-5 py-4 text-slate-600">{sheet.accounting_programs?.[0]?.name || sheet.budget_month?.slice(0, 7) || "-"}</td><td className="px-5 py-4 text-slate-600">{new Date(sheet.created_at).toLocaleDateString("en-GB")}</td><td className="px-5 py-4 text-right"><Button size="icon" variant="ghost" title="Delete budget" disabled={isPending} className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => remove(sheet.id)}><Trash2 className="h-4 w-4" /></Button></td></tr>)}
            {!sheets.length && <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-400">No budgets created yet.</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  )
}
