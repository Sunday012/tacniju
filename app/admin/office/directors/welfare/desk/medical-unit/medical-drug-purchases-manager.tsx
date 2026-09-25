"use client"

import { useMemo, useState, useTransition } from "react"
import { Pill, Plus, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { deleteMedicalDrugPurchase, saveMedicalDrugPurchase } from "./actions"

export type MedicalDrugPurchase = {
  id: string
  drug_name: string
  purchase_date: string
  quantity: number
  unit_cost: number
  supplier: string | null
  notes: string | null
}

const blank = { id: "", drug_name: "", purchase_date: new Date().toISOString().slice(0, 10), quantity: "", unit_cost: "", supplier: "", notes: "" }
const money = (value: number) => value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function MedicalDrugPurchasesManager({ purchases }: { purchases: MedicalDrugPurchase[] }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [form, setForm] = useState(blank)
  const [pending, startTransition] = useTransition()
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return term ? purchases.filter((purchase) => [purchase.drug_name, purchase.supplier || "", purchase.notes || ""].some((value) => value.toLowerCase().includes(term))) : purchases
  }, [purchases, query])

  function edit(purchase?: MedicalDrugPurchase) {
    setForm(purchase ? { ...purchase, quantity: String(purchase.quantity), unit_cost: String(purchase.unit_cost), supplier: purchase.supplier || "", notes: purchase.notes || "" } : blank)
    setOpen(true)
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    startTransition(async () => {
      const result = await saveMedicalDrugPurchase(data)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(form.id ? "Drug purchase updated." : "Drug purchase recorded.")
      setOpen(false)
      setForm(blank)
    })
  }

  function remove(id: string) {
    if (!window.confirm("Delete this drug purchase?")) return
    startTransition(async () => {
      const result = await deleteMedicalDrugPurchase(id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Drug purchase deleted.")
    })
  }

  return <section className="border border-slate-200 bg-white">
    <header className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-extrabold text-slate-900">Purchased Drugs</h2><p className="text-sm text-slate-500">Medicine purchases, quantities, suppliers, and cost.</p></div><Button onClick={() => edit()} className="gap-2 bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4" />Record Purchase</Button></header>
    <div className="border-b border-slate-200 p-4"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search drug or supplier..." className="pl-9" /></div></div>
    <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Drug</th><th className="px-4 py-3 text-right">Quantity</th><th className="px-4 py-3 text-right">Unit Cost</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3">Supplier</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((purchase) => <tr key={purchase.id}><td className="px-4 py-3">{purchase.purchase_date}</td><td className="px-4 py-3 font-bold">{purchase.drug_name}</td><td className="px-4 py-3 text-right font-mono">{purchase.quantity}</td><td className="px-4 py-3 text-right font-mono">NGN {money(purchase.unit_cost)}</td><td className="px-4 py-3 text-right font-mono font-bold">NGN {money(purchase.quantity * purchase.unit_cost)}</td><td className="px-4 py-3">{purchase.supplier || "-"}</td><td className="px-4 py-3 text-right"><button title="Edit purchase" onClick={() => edit(purchase)} className="px-2 font-bold text-indigo-700">Edit</button><button title="Delete purchase" onClick={() => remove(purchase.id)} className="p-2 text-rose-600"><Trash2 className="h-4 w-4" /></button></td></tr>)}{!filtered.length && <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">No purchased drugs recorded.</td></tr>}</tbody></table></div>
    <Sheet open={open} onOpenChange={setOpen}><SheetContent className="w-full overflow-y-auto sm:max-w-xl"><SheetHeader><SheetTitle>{form.id ? "Update Drug Purchase" : "Record Drug Purchase"}</SheetTitle><SheetDescription>Add the medicine purchase details to the Medical Unit register.</SheetDescription></SheetHeader><form onSubmit={submit} className="mt-7 space-y-5"><input type="hidden" name="id" value={form.id} /><label className="grid gap-2"><Label>Drug name</Label><Input name="drug_name" required value={form.drug_name} onChange={(event) => setForm({ ...form, drug_name: event.target.value })} /></label><label className="grid gap-2"><Label>Purchase date</Label><Input name="purchase_date" type="date" required value={form.purchase_date} onChange={(event) => setForm({ ...form, purchase_date: event.target.value })} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2"><Label>Quantity</Label><Input name="quantity" type="number" min="1" required value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /></label><label className="grid gap-2"><Label>Unit cost (NGN)</Label><Input name="unit_cost" type="number" min="0" step="0.01" value={form.unit_cost} onChange={(event) => setForm({ ...form, unit_cost: event.target.value })} /></label></div><label className="grid gap-2"><Label>Supplier</Label><Input name="supplier" value={form.supplier} onChange={(event) => setForm({ ...form, supplier: event.target.value })} /></label><label className="grid gap-2"><Label>Notes</Label><textarea name="notes" rows={4} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="border border-slate-200 p-3 text-sm" /></label><Button disabled={pending} className="w-full bg-indigo-600 hover:bg-indigo-700"><Pill className="mr-2 h-4 w-4" />{pending ? "Saving..." : "Save Drug Purchase"}</Button></form></SheetContent></Sheet>
  </section>
}
