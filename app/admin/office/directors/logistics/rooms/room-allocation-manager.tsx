"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { BedDouble, Building2, Check, Loader2, Plus, RotateCcw, Trash2, UsersRound } from "lucide-react"
import { toast } from "sonner"
import { createLogisticsRoom, createRoomAllocation, deleteLogisticsRoom, deleteRoomAllocation, setRoomAllocationStatus } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"

export type LogisticsRoom = { id: string; name: string; room_number: string; location: string; head_of_room: string | null; capacity: number }
export type RoomAllocation = { id: string; room_id: string | null; room_name: string; occupant_name: string; reservation_number: string | null; capacity: number; allocated_on: string; released_on: string | null; status: "Allocated" | "Released"; notes: string | null }

const floors = ["Ground Floor", "First Floor", "Second Floor", "Third Floor", "Fourth Floor", "Other"]

export function RoomAllocationManager({ rooms, allocations }: { rooms: LogisticsRoom[]; allocations: RoomAllocation[] }) {
  const router = useRouter()
  const [roomOpen, setRoomOpen] = useState(false)
  const [allocationOpen, setAllocationOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState("")
  const [isPending, startTransition] = useTransition()
  const run = (action: () => Promise<{ error?: string | null; success?: boolean }>, message: string, onSuccess?: () => void) =>
    startTransition(async () => {
      const result = await action()
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(message)
      onSuccess?.()
      router.refresh()
    })
  const activeFor = (roomId: string) => allocations.filter((item) => item.room_id === roomId && item.status === "Allocated")
  const openAllocation = (roomId = "") => {
    setSelectedRoom(roomId)
    setAllocationOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" className="border-indigo-200 font-bold text-indigo-700" onClick={() => setRoomOpen(true)}>
          <Building2 className="mr-2 h-4 w-4" />
          Create Room
        </Button>
        <Button className="bg-indigo-600 font-bold text-white hover:bg-indigo-700" onClick={() => openAllocation()} disabled={!rooms.length}>
          <Plus className="mr-2 h-4 w-4" />
          Allocate Person
        </Button>
      </div>

      <Sheet open={roomOpen} onOpenChange={setRoomOpen}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
          <SheetHeader className="border-b px-6 py-5 text-left">
            <SheetTitle>Create Room</SheetTitle>
            <SheetDescription>Add the room before allocating people to it.</SheetDescription>
          </SheetHeader>
          <form
            action={(data) =>
              run(
                () => createLogisticsRoom(data),
                "Room created.",
                () => setRoomOpen(false),
              )
            }
            className="space-y-5 p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <Label>Room name</Label>
                <Input name="name" placeholder="e.g. Deborah Room" required />
              </label>
              <label className="grid gap-1.5">
                <Label>Room number</Label>
                <Input name="room_number" placeholder="e.g. G-04" required />
              </label>
            </div>
            <label className="grid gap-1.5">
              <Label>Floor / location</Label>
              <Select name="location" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select floor" />
                </SelectTrigger>
                <SelectContent>
                  {floors.map((floor) => (
                    <SelectItem key={floor} value={floor}>
                      {floor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="grid gap-1.5">
              <Label>Head of room</Label>
              <Input name="head_of_room" placeholder="Name of room head" />
            </label>
            <label className="grid gap-1.5">
              <Label>Capacity</Label>
              <Input name="capacity" type="number" min="1" defaultValue="1" required />
            </label>
            <Button type="submit" disabled={isPending} className="h-11 w-full bg-indigo-600 font-bold text-white hover:bg-indigo-700">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Building2 className="mr-2 h-4 w-4" />}
              Save Room
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={allocationOpen} onOpenChange={setAllocationOpen}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
          <SheetHeader className="border-b px-6 py-5 text-left">
            <SheetTitle>Allocate Person</SheetTitle>
            <SheetDescription>Select an available room and record its occupant.</SheetDescription>
          </SheetHeader>
          <form
            action={(data) =>
              run(
                () => createRoomAllocation(data),
                "Person allocated.",
                () => setAllocationOpen(false),
              )
            }
            className="space-y-5 p-6"
          >
            <label className="grid gap-1.5">
              <Label>Room</Label>
              <Select name="room_id" value={selectedRoom} onValueChange={setSelectedRoom} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => {
                    const available = room.capacity - activeFor(room.id).length
                    return (
                      <SelectItem key={room.id} value={room.id} disabled={available <= 0}>
                        {room.location} · {room.room_number} · {room.name} ({available} available)
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </label>
            <label className="grid gap-1.5">
              <Label>Occupant</Label>
              <Input name="occupant_name" placeholder="Member or guest name" required />
            </label>
            <label className="grid gap-1.5">
              <Label>Reservation number</Label>
              <Input name="reservation_number" placeholder="Optional" />
            </label>
            <label className="grid gap-1.5">
              <Label>Allocation date</Label>
              <Input name="allocated_on" type="date" required />
            </label>
            <label className="grid gap-1.5">
              <Label>Notes</Label>
              <Textarea name="notes" rows={4} placeholder="Bed or access notes" />
            </label>
            <Button type="submit" disabled={isPending || !selectedRoom} className="h-11 w-full bg-indigo-600 font-bold text-white hover:bg-indigo-700">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BedDouble className="mr-2 h-4 w-4" />}
              Save Allocation
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      <div className="space-y-7">
        {floors.map((location) => {
          const floorRooms = rooms.filter((room) => room.location === location)
          if (!floorRooms.length) return null
          return (
            <section key={location}>
              <h2 className="mb-3 text-sm font-black uppercase tracking-wider text-slate-500">{location}</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {floorRooms.map((room) => {
                  const occupants = activeFor(room.id)
                  const available = Math.max(0, room.capacity - occupants.length)
                  return (
                    <article key={room.id} className="border border-slate-200 bg-white shadow-sm">
                      <header className="flex flex-wrap items-start justify-between gap-3 border-b bg-slate-50 px-5 py-4">
                        <div>
                          <p className="text-xs font-bold uppercase text-indigo-600">Room {room.room_number}</p>
                          <h3 className="mt-1 text-lg font-extrabold text-slate-900">{room.name}</h3>
                          <p className="mt-1 text-sm text-slate-500">Head: {room.head_of_room || "Not assigned"}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-black ${available ? "text-emerald-700" : "text-rose-700"}`}>{available}</p>
                          <p className="text-xs font-bold uppercase text-slate-500">Available of {room.capacity}</p>
                        </div>
                      </header>
                      <div className="divide-y divide-slate-100">
                        {occupants.map((person) => (
                          <div key={person.id} className="flex items-center justify-between gap-3 px-5 py-3">
                            <div>
                              <p className="font-bold text-slate-800">{person.occupant_name}</p>
                              <p className="text-xs text-slate-500">{person.reservation_number || "No reservation number"}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" disabled={isPending} onClick={() => run(() => setRoomAllocationStatus(person.id, "Released"), "Room released.")}>
                                <Check className="mr-1 h-4 w-4" />
                                Release
                              </Button>
                              <Button size="icon" variant="ghost" aria-label={`Delete allocation for ${person.occupant_name}`} className="text-rose-600" onClick={() => run(() => deleteRoomAllocation(person.id), "Allocation deleted.")}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {!occupants.length && <p className="px-5 py-7 text-center text-sm text-slate-400">No one is allocated to this room.</p>}
                      </div>
                      <footer className="flex justify-between border-t px-5 py-3">
                        <Button variant="ghost" size="sm" className="text-rose-600" onClick={() => run(() => deleteLogisticsRoom(room.id), "Room deleted.")}>
                          <Trash2 className="mr-1 h-4 w-4" />
                          Delete
                        </Button>
                        <Button size="sm" variant="outline" disabled={!available} onClick={() => openAllocation(room.id)}>
                          <UsersRound className="mr-1 h-4 w-4" />
                          Add Person
                        </Button>
                      </footer>
                    </article>
                  )
                })}
              </div>
            </section>
          )
        })}
        {!rooms.length && (
          <div className="border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <BedDouble className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 font-bold text-slate-700">No rooms created yet</p>
            <p className="mt-1 text-sm text-slate-500">Create rooms by floor before allocating people.</p>
          </div>
        )}
      </div>

      {!!allocations.filter((item) => item.status === "Released").length && (
        <section className="border border-slate-200 bg-white">
          <h2 className="border-b bg-slate-50 px-5 py-3 text-sm font-black uppercase text-slate-500">Released allocations</h2>
          <div className="divide-y">
            {allocations
              .filter((item) => item.status === "Released")
              .map((item) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span>
                    <strong>{item.occupant_name}</strong> · {item.room_name}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => run(() => setRoomAllocationStatus(item.id, "Allocated"), "Allocation restored.")}>
                    <RotateCcw className="mr-1 h-4 w-4" />
                    Restore
                  </Button>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  )
}
