"use client"
import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowUp, Eye, Loader2, Plus, Send, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { OrderServiceDocument, type OrderServiceDocumentData } from "@/components/admin/order-service-document"
import { PrintOrderButton } from "@/components/admin/print-order-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { addOrderServiceItem, deleteOrderServiceItem, moveOrderServiceItem, sendOrderServiceToSecretariat, setOrderServiceStatus } from "../actions"

const itemTypes = ["Chorus", "Hymn", "Singing", "Devotional Service", "Worship", "Offering", "Greeting", "Bible Reading", "Announcement", "Sermon", "Prayer", "Custom"]
type Service = OrderServiceDocumentData & {
  id: string
  status: "Draft" | "Posted" | "Cleared"
  sent_to_secretariat_at: string | null
}
export function OrderServiceBuilder({ service }: { service: Service }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const run = (action: () => Promise<{ error?: string | null; success?: boolean }>, message: string, close = false) =>
    startTransition(async () => {
      const result = await action()
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(message)
      if (close) setOpen(false)
      router.refresh()
    })
  const add = (data: FormData) => run(() => addOrderServiceItem(service.id, data), "Service item added.", true)
  const event = Array.isArray(service.events) ? service.events[0] : service.events
  return (
    <div className="space-y-6">
      <header className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b pb-6">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Logistics · {service.status}</p>
          <h1 className="mt-2 text-3xl font-extrabold">{service.title}</h1>
          <p className="mt-2 text-slate-500">
            {event?.name} · {event?.event_date ? new Date(`${event.event_date}T00:00:00`).toLocaleDateString("en-GB") : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PrintOrderButton />
          <Link href={`/admin/office/directors/logistics/anchor/${service.id}`}>
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Anchor View
            </Button>
          </Link>
          <Button variant="outline" disabled={pending || !!service.sent_to_secretariat_at} onClick={() => run(() => sendOrderServiceToSecretariat(service.id), "Sent to Secretariat.")}>
            <Send className="mr-2 h-4 w-4" />
            {service.sent_to_secretariat_at ? "Sent" : "Send to Secretariat"}
          </Button>
          <Button className="bg-indigo-600 font-bold" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </header>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" disabled={pending || service.status === "Draft"} onClick={() => run(() => setOrderServiceStatus(service.id, "Draft"), "Moved to draft.")}>
          Draft
        </Button>
        <Button className="bg-emerald-600 font-bold hover:bg-emerald-700" disabled={pending || service.status === "Posted" || !service.items.length} onClick={() => run(() => setOrderServiceStatus(service.id, "Posted"), "Order posted.")}>
          Post for Members
        </Button>
        <Button variant="outline" disabled={pending || service.status === "Cleared"} onClick={() => run(() => setOrderServiceStatus(service.id, "Cleared"), "Order cleared.")}>
          Clear
        </Button>
      </div>
      <section className="border bg-white">
        <div className="grid grid-cols-[3rem_1fr_8rem_9rem] border-b bg-slate-50 px-4 py-3 text-xs font-black uppercase text-slate-500">
          <span>No.</span>
          <span>Item</span>
          <span>Time</span>
          <span className="text-right">Actions</span>
        </div>
        {service.items.map((item, index) => (
          <div key={item.id} className="grid grid-cols-[3rem_1fr_8rem_9rem] items-center border-b px-4 py-3 text-sm">
            <strong>{index + 1}</strong>
            <div>
              <p className="font-bold">{item.title}</p>
              <p className="text-xs text-slate-500">{item.item_type}</p>
            </div>
            <span className="font-mono">{item.scheduled_time?.slice(0, 5) || "-"}</span>
            <div className="flex justify-end gap-1">
              <Button size="icon" variant="ghost" disabled={index === 0 || pending} onClick={() => run(() => moveOrderServiceItem(service.id, item.id, "up"), "Item moved.")}>
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" disabled={index === service.items.length - 1 || pending} onClick={() => run(() => moveOrderServiceItem(service.id, item.id, "down"), "Item moved.")}>
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="text-rose-600" onClick={() => run(() => deleteOrderServiceItem(service.id, item.id), "Item deleted.")}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {!service.items.length && <p className="py-12 text-center text-slate-400">Add the first service item.</p>}
      </section>
      <details className="border bg-slate-50 p-4">
        <summary className="cursor-pointer font-bold text-slate-700">Preview finished document</summary>
        <div className="mt-4">
          <OrderServiceDocument service={service} />
        </div>
      </details>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full p-0 sm:max-w-xl">
          <SheetHeader className="border-b px-6 py-5 text-left">
            <SheetTitle>Add Service Item</SheetTitle>
            <SheetDescription>Choose a standard item or enter a custom title.</SheetDescription>
          </SheetHeader>
          <form action={add} className="space-y-5 p-6">
            <label className="grid gap-1.5">
              <Label>Item type</Label>
              <Select name="item_type" defaultValue="Chorus">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {itemTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="grid gap-1.5">
              <Label>Custom title (optional)</Label>
              <Input name="title" placeholder="Overrides the selected item type" />
            </label>
            <label className="grid gap-1.5">
              <Label>Time (optional)</Label>
              <Input name="scheduled_time" type="time" />
            </label>
            <Button className="h-11 w-full bg-indigo-600 font-bold" disabled={pending}>
              {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add Item
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
