"use client"

import { CalendarCheck, Users } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type AttendanceMember = {
  id: string
  full_name: string | null
  reservation_number: string | null
  points: number | null
  marked_at: string | null
}

export function AttendanceEventMembersSheet({
  name,
  eventDate,
  description,
  members,
}: {
  name: string
  eventDate: string
  description?: string | null
  members: AttendanceMember[]
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="group w-full rounded-lg px-2 py-1 text-left transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200">
          <span className="block font-bold text-slate-800 group-hover:text-indigo-700">{name}</span>
          {description ? <span className="mt-1 block text-xs text-slate-400">{description}</span> : null}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col border-slate-200 bg-white p-0 text-slate-900 sm:max-w-lg">
        <SheetHeader className="border-b border-slate-100 px-6 py-5 text-left">
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <SheetTitle className="text-xl font-extrabold text-slate-900">{name}</SheetTitle>
          <SheetDescription className="text-sm font-medium text-slate-500">
            {new Date(eventDate).toLocaleDateString()} · {members.length} attendee{members.length === 1 ? "" : "s"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {members.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm font-bold text-slate-500">
              No members have been marked for this event yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {members.map(member => (
                <div key={member.id} className="flex items-center gap-3 px-6 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black text-slate-800">{member.full_name || "Unknown User"}</div>
                    <div className="mt-0.5 text-xs font-bold text-slate-400">
                      {member.reservation_number || "-"} · {member.points || 0} pts
                    </div>
                  </div>
                  {member.marked_at ? (
                    <div className="text-xs font-bold text-slate-400">
                      {new Date(member.marked_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
