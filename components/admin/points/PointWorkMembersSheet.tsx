"use client"

import { Users } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type PointWorkMember = {
  id: string
  full_name: string | null
  reservation_number: string | null
  points: number | null
}

export function PointWorkMembersSheet({
  title,
  mode,
  points,
  note,
  members,
}: {
  title: string
  mode: "add" | "remove"
  points: number
  note?: string | null
  members: PointWorkMember[]
}) {
  const signedPoints = `${mode === "remove" ? "-" : "+"}${points}`

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="group w-full rounded-lg px-2 py-1 text-left transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200">
          <span className="block font-bold text-slate-800 group-hover:text-indigo-700">{title}</span>
          {note ? <span className="mt-1 block text-xs text-slate-400">{note}</span> : null}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col border-slate-200 bg-white p-0 text-slate-900 sm:max-w-lg">
        <SheetHeader className="border-b border-slate-100 px-6 py-5 text-left">
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Users className="h-5 w-5" />
          </div>
          <SheetTitle className="text-xl font-extrabold text-slate-900">{title}</SheetTitle>
          <SheetDescription className="text-sm font-medium text-slate-500">
            {members.length} member{members.length === 1 ? "" : "s"} under this work · {signedPoints} points each
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {members.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm font-bold text-slate-500">
              No members have been added to this work yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {members.map(member => (
                <div key={member.id} className="flex items-center gap-3 px-6 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-600">
                    {(member.full_name || "U").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black text-slate-800">{member.full_name || "Unnamed"}</div>
                    <div className="mt-0.5 text-xs font-bold text-slate-400">
                      {member.reservation_number || "-"} · {member.points || 0} pts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
