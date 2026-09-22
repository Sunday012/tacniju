"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check, Pencil, Plus, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { createBudgetGroup, createBudgetItem, deleteBudgetGroup, deleteBudgetItem, updateBudgetItem, updateBudgetSheetAmount, type BudgetGroup, type BudgetItem, type BudgetSheet } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const money = (value: number) => value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function BudgetSheetManager({ sheet, groups, items }: { sheet: BudgetSheet; groups: BudgetGroup[]; items: BudgetItem[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [groupName, setGroupName] = useState("")
  const [groupSection, setGroupSection] = useState<BudgetGroup["section"]>("Expense")
  const [itemNames, setItemNames] = useState<Record<string, string>>({})
  const [isEditingApprovedBudget, setIsEditingApprovedBudget] = useState(false)
  const [approvedBudgetInput, setApprovedBudgetInput] = useState(String(sheet.budget_amount || 0))
  const byGroup = new Map(groups.map((group) => [group.id, items.filter((item) => item.budget_group_id === group.id)]))
  const approvedBudget = Number(sheet.budget_amount || 0)
  const allocatedBudget = items.reduce((sum, item) => sum + Number(item.budget_amount || 0), 0)
  const allActual = items.reduce((sum, item) => sum + Number(item.actual_amount || 0), 0)

  const run = (action: () => Promise<{ error?: string; success?: boolean }>, message: string, onSuccess?: () => void) => startTransition(async () => {
    const result = await action()
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success(message)
    onSuccess?.()
    router.refresh()
  })

  const saveApprovedBudget = () => {
    const nextAmount = Number(approvedBudgetInput)
    if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
      toast.error("Enter an approved budget greater than zero.")
      return
    }
    run(
      () => updateBudgetSheetAmount(sheet.id, nextAmount),
      "Approved budget updated.",
      () => setIsEditingApprovedBudget(false),
    )
  }

  const cancelApprovedBudgetEdit = () => {
    setApprovedBudgetInput(String(sheet.budget_amount || 0))
    setIsEditingApprovedBudget(false)
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-px overflow-hidden border border-slate-200 bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">
        <div className="bg-white px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase text-slate-500">Approved Budget</p>
            {!isEditingApprovedBudget && (
              <Button variant="ghost" size="icon" title="Edit approved budget" disabled={isPending} className="h-8 w-8 text-slate-500" onClick={() => setIsEditingApprovedBudget(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
          {isEditingApprovedBudget ? (
            <div className="mt-2 flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs font-bold text-slate-500">NGN</span>
                <Input
                  autoFocus
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={approvedBudgetInput}
                  onChange={(event) => setApprovedBudgetInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") saveApprovedBudget()
                    if (event.key === "Escape") cancelApprovedBudgetEdit()
                  }}
                  className="pl-12 text-right font-mono font-bold"
                  aria-label="Approved budget amount"
                />
              </div>
              <Button size="icon" title="Save approved budget" disabled={isPending} className="h-9 w-9 shrink-0 bg-indigo-600 hover:bg-indigo-700" onClick={saveApprovedBudget}>
                <Check className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" title="Cancel editing" disabled={isPending} className="h-9 w-9 shrink-0" onClick={cancelApprovedBudgetEdit}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="mt-1 font-mono text-xl font-extrabold text-slate-900">NGN {money(approvedBudget)}</p>
          )}
        </div>
        <div className="bg-white px-5 py-4"><p className="text-xs font-bold uppercase text-slate-500">Allocated to Items</p><p className="mt-1 font-mono text-xl font-extrabold text-slate-900">NGN {money(allocatedBudget)}</p></div>
        <div className="bg-white px-5 py-4"><p className="text-xs font-bold uppercase text-slate-500">Actual Amount</p><p className="mt-1 font-mono text-xl font-extrabold text-slate-900">NGN {money(allActual)}</p></div>
        <div className="bg-white px-5 py-4"><p className="text-xs font-bold uppercase text-slate-500">Remaining</p><p className={`mt-1 font-mono text-xl font-extrabold ${approvedBudget - allActual >= 0 ? "text-emerald-700" : "text-rose-700"}`}>NGN {money(approvedBudget - allActual)}</p></div>
      </section>

      <section className="border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end"><label className="grid flex-1 gap-1.5"><Label>New Group</Label><Input value={groupName} onChange={(event) => setGroupName(event.target.value)} placeholder="e.g. Transport" /></label><label className="grid gap-1.5 sm:w-44"><Label>Section</Label><Select value={groupSection} onValueChange={(value) => setGroupSection(value as BudgetGroup["section"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Income">Income</SelectItem><SelectItem value="Expense">Expense</SelectItem><SelectItem value="Savings">Savings</SelectItem></SelectContent></Select></label><Button disabled={isPending} onClick={() => run(async () => { const result = await createBudgetGroup(sheet.id, groupName, groupSection); if (!result.error) setGroupName(""); return result }, "Group created.")}><Plus className="mr-2 h-4 w-4" />Create Group</Button></div>
      </section>

      {groups.map((group) => {
        const groupItems = byGroup.get(group.id) || []
        const groupBudget = groupItems.reduce((sum, item) => sum + Number(item.budget_amount || 0), 0)
        const groupActual = groupItems.reduce((sum, item) => sum + Number(item.actual_amount || 0), 0)
        return <section key={group.id} className="overflow-x-auto border border-slate-200 bg-white shadow-sm"><header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3"><div><p className="text-xs font-black uppercase tracking-wider text-slate-500">{group.section}</p><h2 className="font-extrabold text-slate-900">{group.name}</h2></div><div className="flex items-center gap-3"><span className="hidden text-right text-xs text-slate-500 sm:block">Group Total<br /><strong className="font-mono text-slate-900">NGN {money(groupBudget)}</strong></span><Button variant="ghost" size="icon" title="Delete group" disabled={isPending} className="text-rose-600 hover:bg-rose-50" onClick={() => run(() => deleteBudgetGroup(group.id), "Group deleted.")}><Trash2 className="h-4 w-4" /></Button></div></header><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-white text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Items</th><th className="px-4 py-3 text-right">Budget Amount</th><th className="px-4 py-3 text-right">Actual Amount</th><th className="px-4 py-3 text-right">Difference</th><th className="px-4 py-3">Notes</th><th className="w-12" /></tr></thead><tbody className="divide-y divide-slate-100">{groupItems.map((item) => <BudgetItemRow key={item.id} item={item} isPending={isPending} onSave={(updates) => run(() => updateBudgetItem(item.id, updates), "Budget item updated.")} onDelete={() => run(() => deleteBudgetItem(item.id), "Budget item deleted.")} />)}<tr className="bg-slate-50"><td colSpan={1} className="px-4 py-3 font-bold text-slate-700">Group Total</td><td className="px-4 py-3 text-right font-mono font-bold">NGN {money(groupBudget)}</td><td className="px-4 py-3 text-right font-mono font-bold">NGN {money(groupActual)}</td><td className="px-4 py-3 text-right font-mono font-bold">NGN {money(groupBudget - groupActual)}</td><td colSpan={2} /></tr></tbody></table><div className="flex gap-2 border-t border-slate-200 p-3"><Input value={itemNames[group.id] || ""} onChange={(event) => setItemNames((current) => ({ ...current, [group.id]: event.target.value }))} placeholder="Add budget item" /><Button variant="outline" disabled={isPending} onClick={() => run(async () => { const result = await createBudgetItem(sheet.id, group.id, itemNames[group.id] || ""); if (!result.error) setItemNames((current) => ({ ...current, [group.id]: "" })); return result }, "Item added.")}><Plus className="mr-2 h-4 w-4" />Add Item</Button></div></section>
      })}
      {!groups.length && <div className="border border-dashed border-slate-300 bg-white px-5 py-12 text-center text-slate-500">Create a group to begin this budget.</div>}
    </div>
  )
}

function BudgetItemRow({ item, isPending, onSave, onDelete }: { item: BudgetItem; isPending: boolean; onSave: (updates: { name?: string; budget_amount?: number; actual_amount?: number; notes?: string }) => void; onDelete: () => void }) {
  const [name, setName] = useState(item.name)
  const [budget, setBudget] = useState(String(item.budget_amount || 0))
  const [actual, setActual] = useState(String(item.actual_amount || 0))
  const [notes, setNotes] = useState(item.notes || "")
  const difference = Number(budget || 0) - Number(actual || 0)
  return <tr><td className="px-4 py-2"><Input value={name} onChange={(event) => setName(event.target.value)} onBlur={() => onSave({ name })} /></td><td className="px-4 py-2"><Input className="text-right font-mono" type="number" min="0" step="0.01" value={budget} onChange={(event) => setBudget(event.target.value)} onBlur={() => onSave({ budget_amount: Number(budget || 0) })} /></td><td className="px-4 py-2"><Input className="text-right font-mono" type="number" min="0" step="0.01" value={actual} onChange={(event) => setActual(event.target.value)} onBlur={() => onSave({ actual_amount: Number(actual || 0) })} /></td><td className={`px-4 py-2 text-right font-mono font-semibold ${difference >= 0 ? "text-emerald-700" : "text-rose-700"}`}>NGN {money(difference)}</td><td className="px-4 py-2"><Input value={notes} onChange={(event) => setNotes(event.target.value)} onBlur={() => onSave({ notes })} /></td><td className="px-2"><Button variant="ghost" size="icon" title="Delete item" disabled={isPending} className="text-rose-600 hover:bg-rose-50" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button></td></tr>
}
