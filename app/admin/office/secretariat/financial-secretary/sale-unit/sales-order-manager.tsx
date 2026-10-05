"use client"

import { useState, useTransition } from "react"
import { Plus, Send, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { createSalesUnitOrder, deleteSalesUnitOrder } from "./actions"

type Item = { itemName: string; quantity: string; amount: string }
const blankItem = (): Item => ({ itemName: "", quantity: "1", amount: "" })

export function SalesOrderManager() {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10))
  const [partyName, setPartyName] = useState("")
  const [items, setItems] = useState<Item[]>([blankItem()])
  function updateItem(index: number, field: keyof Item, value: string) { setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item)) }
  function save(send: boolean) {
    startTransition(async () => {
      const result = await createSalesUnitOrder({ orderDate, partyName, send, items: items.map((item) => ({ itemName: item.itemName, quantity: Number(item.quantity), amount: Number(item.amount) })) })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(send ? `${result.orderNo} saved and sent.` : `${result.orderNo} saved as draft.`)
      setPartyName(""); setItems([blankItem()]); setOpen(false)
    })
  }
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild><Button className="h-11 bg-indigo-600 px-5 font-black text-white hover:bg-indigo-700"><Plus className="mr-2 h-4 w-4" />Create Sales Order</Button></SheetTrigger>
      <SheetContent className="w-full p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-slate-200 px-6 py-6 pr-12 text-left"><SheetTitle className="text-2xl font-black">Create Sales Order</SheetTitle><SheetDescription>Record a Sales Unit order and optionally send it to the Financial Secretary.</SheetDescription></SheetHeader>
        <div className="space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-bold text-slate-800">Date<Input type="date" value={orderDate} onChange={(event) => setOrderDate(event.target.value)} /></label>
            <label className="space-y-2 text-sm font-bold text-slate-800">Party name<Input value={partyName} onChange={(event) => setPartyName(event.target.value)} placeholder="Customer or party name" /></label>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-[minmax(0,1fr)_80px_120px_40px] gap-2 text-[11px] font-black uppercase tracking-wider text-slate-500"><span>Item</span><span>Qty</span><span>Unit amount</span><span /></div>
            {items.map((item, index) => <div key={index} className="grid grid-cols-[minmax(0,1fr)_80px_120px_40px] gap-2">
              <Input value={item.itemName} onChange={(event) => updateItem(index, "itemName", event.target.value)} placeholder="Item name" />
              <Input type="number" min="0.01" step="0.01" value={item.quantity} onChange={(event) => updateItem(index, "quantity", event.target.value)} />
              <Input type="number" min="0" step="0.01" value={item.amount} onChange={(event) => updateItem(index, "amount", event.target.value)} placeholder="0.00" />
              <Button type="button" variant="ghost" size="icon" disabled={items.length === 1} onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove item"><Trash2 className="h-4 w-4" /></Button>
            </div>)}
            <Button type="button" variant="outline" onClick={() => setItems((current) => [...current, blankItem()])}><Plus className="mr-2 h-4 w-4" />Add Item</Button>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end"><Button type="button" variant="outline" disabled={pending} onClick={() => save(false)}>Save</Button><Button type="button" disabled={pending} onClick={() => save(true)} className="bg-indigo-600 font-black text-white hover:bg-indigo-700"><Send className="mr-2 h-4 w-4" />Save &amp; Send</Button></div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function DeleteSalesOrderButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()
  return <Button type="button" variant="ghost" size="icon" disabled={pending} onClick={() => startTransition(async () => { const result = await deleteSalesUnitOrder(id); if (result.error) toast.error(result.error); else toast.success("Sales order deleted.") })} aria-label="Delete sales order"><Trash2 className="h-4 w-4 text-red-500" /></Button>
}
