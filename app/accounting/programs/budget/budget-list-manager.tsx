"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LayoutList, Loader2, Plus, ReceiptText, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { createBudgetSheet, deleteBudgetSheet, type BudgetSheet } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

type Program = { id: string; name: string }
type Event = { id: string; name: string; event_date: string }
type BudgetBoxDetail = { sheet: BudgetSheet; items: Array<{ id: string; name: string; budget_amount: number; actual_amount: number }> }

const money = (value: number) => value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const shortDate = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split("-")
  return `${day}/${month}/${year}`
}

export function BudgetListManager({ sheets, programs, events = [], boxDetails = [], type, budgetBasePath = "/admin/office/admin-office/budget" }: { sheets: BudgetSheet[]; programs: Program[]; events?: Event[]; boxDetails?: BudgetBoxDetail[]; type?: "Monthly" | "Program"; budgetBasePath?: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [view, setView] = useState<"list" | "box">("list")
  const [budgetType, setBudgetType] = useState<"Monthly" | "Program">(type || "Monthly")
  const [title, setTitle] = useState("")
  const [budgetAmount, setBudgetAmount] = useState("")
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [programId, setProgramId] = useState("")
  const [eventId, setEventId] = useState("")

  const create = () => {
    const formData = new FormData()
    formData.set("budget_type", budgetType)
    formData.set("title", title || (budgetType === "Monthly" ? `Monthly Budget - ${month}` : "Program Budget"))
    formData.set("budget_amount", budgetAmount)
    formData.set("budget_month", month)
    formData.set("program_id", programId)
    formData.set("event_id", eventId)
    startTransition(async () => {
      const result = await createBudgetSheet(formData)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Budget created.")
      setIsCreateOpen(false)
      router.push(`${budgetBasePath}/${result.id}`)
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
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
        <div className="inline-flex border border-slate-200 bg-white p-1 shadow-sm">
          <Button size="sm" variant="ghost" aria-pressed={view === "list"} className={view === "list" ? "border border-indigo-700 bg-indigo-600 font-bold text-white shadow-sm hover:bg-indigo-700 hover:text-white" : "border border-transparent bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"} onClick={() => setView("list")}>
            <LayoutList className="mr-2 h-4 w-4" />
            List
          </Button>
          <Button size="sm" variant="ghost" aria-pressed={view === "box"} className={view === "box" ? "border border-indigo-700 bg-indigo-600 font-bold text-white shadow-sm hover:bg-indigo-700 hover:text-white" : "border border-transparent bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"} onClick={() => setView("box")}>
            <ReceiptText className="mr-2 h-4 w-4" />
            Box
          </Button>
        </div>
        <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <SheetTrigger asChild>
            <Button className="h-11 border border-indigo-700 bg-indigo-600 px-5 font-bold text-white shadow-sm hover:bg-indigo-700 hover:text-white focus-visible:ring-indigo-500">
              <Plus className="mr-2 h-4 w-4" />
              Create Budget
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex h-dvh w-full flex-col overflow-y-auto border-slate-200 bg-slate-50 p-0 text-slate-900 sm:max-w-xl">
            <SheetHeader className="border-b border-slate-200 bg-white px-6 py-5 text-left">
              <SheetTitle>Create Budget</SheetTitle>
              <SheetDescription>Set up the budget before adding groups and items.</SheetDescription>
            </SheetHeader>
            <div className="grid gap-5 p-6">
              {!type && (
                <label className="grid gap-1.5">
                  <Label>Budget Type</Label>
                  <Select value={budgetType} onValueChange={(value) => setBudgetType(value as "Monthly" | "Program")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly">Monthly Budget</SelectItem>
                      <SelectItem value="Program">Program Budget</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
              )}
              {budgetType === "Monthly" ? (
                <label className="grid gap-1.5">
                  <Label>Month</Label>
                  <Input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
                </label>
              ) : (
                <>
                  <label className="grid gap-1.5">
                    <Label>Program</Label>
                    <Select value={programId} onValueChange={setProgramId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent>
                        {programs.map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="grid gap-1.5">
                    <Label>Event</Label>
                    <Select value={eventId} onValueChange={setEventId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.name} · {shortDate(event.event_date)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                </>
              )}
              <label className="grid gap-1.5">
                <Label>Budget Title</Label>
                <Input key={`${budgetType}-${isCreateOpen}`} defaultValue={title} onInput={(event) => setTitle(event.currentTarget.value)} className="bg-white text-slate-900 caret-indigo-600" placeholder={budgetType === "Monthly" ? "Monthly Budget" : "Program Budget"} />
              </label>
              <label className="grid gap-1.5">
                <Label>Approved Budget Amount (NGN)</Label>
                <Input type="number" min="0" step="0.01" value={budgetAmount} onChange={(event) => setBudgetAmount(event.target.value)} placeholder="0.00" />
              </label>
              <Button className="h-11 border border-indigo-700 bg-indigo-600 font-bold text-white shadow-sm hover:bg-indigo-700 hover:text-white focus-visible:ring-indigo-500" disabled={isPending || Number(budgetAmount) <= 0 || (budgetType === "Program" && (!programId || !eventId))} onClick={create}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Create Budget
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {view === "list" ? (
        <section className="overflow-x-auto border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Budget</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Program / Month</th>
                <th className="px-5 py-3">Event</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sheets.map((sheet) => (
                <tr key={sheet.id}>
                  <td className="px-5 py-4">
                    <Link href={`${budgetBasePath}/${sheet.id}`} className="font-bold text-slate-900 hover:text-indigo-700">
                      {sheet.title}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{sheet.budget_type}</td>
                  <td className="px-5 py-4 text-slate-600">{sheet.accounting_programs?.[0]?.name || sheet.budget_month?.slice(0, 7) || "-"}</td>
                  <td className="px-5 py-4 text-slate-600">{sheet.events?.[0]?.name || "-"}</td>
                  <td className="px-5 py-4 text-right font-mono font-bold text-slate-800">NGN {money(Number(sheet.budget_amount || 0))}</td>
                  <td className="px-5 py-4 text-slate-600">{shortDate(sheet.created_at)}</td>
                  <td className="px-5 py-4 text-right">
                    <Button size="icon" variant="ghost" title="Delete budget" aria-label={`Delete ${sheet.title}`} disabled={isPending} className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => remove(sheet.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {!sheets.length && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No budgets created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      ) : (
        <div className="space-y-4">
          {boxDetails.map((detail) => {
            const budget = Number(detail.sheet.budget_amount || 0)
            const allocated = detail.items.reduce((sum, item) => sum + Number(item.budget_amount || 0), 0)
            const actual = detail.items.reduce((sum, item) => sum + Number(item.actual_amount || 0), 0)
            return (
              <Link key={detail.sheet.id} href={`${budgetBasePath}/${detail.sheet.id}`} className="block overflow-hidden border border-slate-200 bg-white shadow-sm transition-colors hover:border-indigo-300">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-500">{detail.sheet.budget_type} Budget</p>
                    <p className="font-extrabold text-slate-900">{detail.sheet.title}</p>
                  </div>
                  <strong className="font-mono text-slate-900">NGN {money(budget)}</strong>
                </div>
                <div className="grid gap-px bg-slate-200 sm:grid-cols-4">
                  <div className="bg-white px-5 py-3 text-sm">
                    <p className="text-xs font-bold uppercase text-slate-500">Approved</p>
                    <p className="mt-1 font-mono font-bold">NGN {money(budget)}</p>
                  </div>
                  <div className="bg-white px-5 py-3 text-sm">
                    <p className="text-xs font-bold uppercase text-slate-500">Allocated</p>
                    <p className="mt-1 font-mono font-bold">NGN {money(allocated)}</p>
                  </div>
                  <div className="bg-white px-5 py-3 text-sm">
                    <p className="text-xs font-bold uppercase text-slate-500">Actual</p>
                    <p className="mt-1 font-mono font-bold">NGN {money(actual)}</p>
                  </div>
                  <div className="bg-white px-5 py-3 text-sm">
                    <p className="text-xs font-bold uppercase text-slate-500">Remaining</p>
                    <p className={`mt-1 font-mono font-bold ${budget - actual >= 0 ? "text-emerald-700" : "text-rose-700"}`}>NGN {money(budget - actual)}</p>
                  </div>
                </div>
              </Link>
            )
          })}
          {!boxDetails.length && <div className="border border-slate-200 bg-white px-5 py-12 text-center text-slate-400">Create a budget to see its box view.</div>}
        </div>
      )}
    </div>
  )
}
