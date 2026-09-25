"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { BedDouble, Check, Loader2, Plus, RotateCcw, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { createRoomAllocation, deleteRoomAllocation, setRoomAllocationStatus } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"

export type RoomAllocation = { id: string; room_name: string; occupant_name: string; reservation_number: string | null; capacity: number; allocated_on: string; released_on: string | null; status: "Allocated" | "Released"; notes: string | null }

export function RoomAllocationManager({ allocations }: { allocations: RoomAllocation[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

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

  const submit = (formData: FormData) => run(() => createRoomAllocation(formData), "Room allocated.", () => setOpen(false))

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild><Button className="bg-indigo-600 font-bold text-white hover:bg-indigo-700"><Plus className="mr-2 h-4 w-4" />Allocate Room</Button></SheetTrigger>
          <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-xl">
            <SheetHeader className="border-b border-slate-200 px-6 py-5 text-left"><SheetTitle>Allocate Room</SheetTitle><SheetDescription>Assign a room to a member or guest.</SheetDescription></SheetHeader>
            <form action={submit} className="space-y-5 p-6">
              <label className="grid gap-1.5"><Label>Room</Label><Input name="room_name" placeholder="e.g. Block A, Room 12" required /></label>
              <label className="grid gap-1.5"><Label>Occupant</Label><Input name="occupant_name" placeholder="Member or guest name" required /></label>
              <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-1.5"><Label>Reservation Number</Label><Input name="reservation_number" placeholder="Optional" /></label><label className="grid gap-1.5"><Label>Capacity</Label><Input name="capacity" type="number" min="1" defaultValue="1" required /></label></div>
              <label className="grid gap-1.5"><Label>Allocation Date</Label><Input name="allocated_on" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></label>
              <label className="grid gap-1.5"><Label>Notes</Label><Textarea name="notes" rows={5} placeholder="Access, bed, or allocation notes" /></label>
              <Button type="submit" disabled={isPending} className="w-full bg-indigo-600 font-bold text-white hover:bg-indigo-700">{isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BedDouble className="mr-2 h-4 w-4" />}Save Allocation</Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Room</th><th className="px-4 py-3">Occupant</th><th className="px-4 py-3">Reservation</th><th className="px-4 py-3">Allocated</th><th className="px-4 py-3">Capacity</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">
          {allocations.map((allocation) => <tr key={allocation.id}><td className="px-4 py-3 font-bold text-slate-900">{allocation.room_name}</td><td className="px-4 py-3">{allocation.occupant_name}<p className="mt-0.5 text-xs text-slate-500">{allocation.notes || "No notes"}</p></td><td className="px-4 py-3 font-mono text-xs">{allocation.reservation_number || "-"}</td><td className="px-4 py-3">{new Date(`${allocation.allocated_on}T00:00:00`).toLocaleDateString("en-GB")}</td><td className="px-4 py-3">{allocation.capacity}</td><td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-bold ${allocation.status === "Allocated" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{allocation.status}</span></td><td className="px-4 py-3"><div className="flex justify-end gap-1">{allocation.status === "Allocated" ? <Button variant="outline" size="sm" disabled={isPending} onClick={() => run(() => setRoomAllocationStatus(allocation.id, "Released"), "Room released.")}><Check className="mr-2 h-4 w-4" />Release</Button> : <Button variant="outline" size="sm" disabled={isPending} onClick={() => run(() => setRoomAllocationStatus(allocation.id, "Allocated"), "Allocation restored.")}><RotateCcw className="mr-2 h-4 w-4" />Restore</Button>}<Button variant="ghost" size="icon" title="Delete allocation" disabled={isPending} className="text-rose-600" onClick={() => run(() => deleteRoomAllocation(allocation.id), "Allocation deleted.")}><Trash2 className="h-4 w-4" /></Button></div></td></tr>)}
          {!allocations.length && <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">No room allocations yet.</td></tr>}
        </tbody></table></div>
      </section>
    </div>
  )
}
