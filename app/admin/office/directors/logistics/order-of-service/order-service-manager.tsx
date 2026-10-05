"use client"
import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CalendarDays, FilePlus2, Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { createOrderService, deleteOrderService } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"

type Event = { id: string; name: string; event_date: string }
type Service = {
  id: string
  title: string
  status: string
  sent_to_secretariat_at: string | null
  created_at: string
  events: { name: string; event_date: string } | { name: string; event_date: string }[] | null
}
export function OrderServiceManager({ events, services }: { events: Event[]; services: Service[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const submit = (data: FormData) =>
    startTransition(async () => {
      const result = await createOrderService(data)
      if (result.error) {
        toast.error(result.error)
        return
      }
      setOpen(false)
      router.push(`/admin/office/directors/logistics/order-of-service/${result.id}`)
    })
  const remove = (id: string) => {
    if (!window.confirm("Delete this order of service?")) return
    startTransition(async () => {
      const result = await deleteOrderService(id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Order of service deleted.")
      router.refresh()
    })
  }
  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)} className="bg-indigo-600 font-bold text-white hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" />
          Create Order
        </Button>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full p-0 sm:max-w-xl">
          <SheetHeader className="border-b px-6 py-5 text-left">
            <SheetTitle>Create Order of Service</SheetTitle>
            <SheetDescription>Choose the event before adding service items.</SheetDescription>
          </SheetHeader>
          <form action={submit} className="space-y-5 p-6">
            <label className="grid gap-1.5">
              <Label>Event</Label>
              <Select name="event_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name} · {new Date(`${event.event_date}T00:00:00`).toLocaleDateString("en-GB")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="grid gap-1.5">
              <Label>Title</Label>
              <Input name="title" placeholder="e.g. Sunday Worship Service" required />
            </label>
            <Button className="h-11 w-full bg-indigo-600 font-bold text-white hover:bg-indigo-700" disabled={pending}>
              {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FilePlus2 className="mr-2 h-4 w-4" />}
              Create and Add Items
            </Button>
          </form>
        </SheetContent>
      </Sheet>
      <section className="overflow-x-auto border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Service</th>
              <th className="px-5 py-3">Event</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Secretariat</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {services.map((service) => {
              const event = Array.isArray(service.events) ? service.events[0] : service.events
              return (
                <tr key={service.id}>
                  <td className="px-5 py-4">
                    <Link className="font-bold text-slate-900 hover:text-indigo-700" href={`/admin/office/directors/logistics/order-of-service/${service.id}`}>
                      {service.title}
                    </Link>
                  </td>
                  <td className="px-5 py-4">{event?.name || "-"}</td>
                  <td className="px-5 py-4">{event?.event_date ? new Date(`${event.event_date}T00:00:00`).toLocaleDateString("en-GB") : "-"}</td>
                  <td className="px-5 py-4">
                    <span className="bg-slate-100 px-2 py-1 text-xs font-bold">{service.status}</span>
                  </td>
                  <td className="px-5 py-4">{service.sent_to_secretariat_at ? "Sent" : "Not sent"}</td>
                  <td className="px-5 py-4 text-right">
                    <Button size="icon" variant="ghost" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" disabled={pending} onClick={() => remove(service.id)} aria-label={`Delete ${service.title}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              )
            })}
            {!services.length && (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center text-slate-400">
                  <CalendarDays className="mx-auto mb-2 h-7 w-7" />
                  No orders of service created.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}
