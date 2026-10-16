"use client"

import { useState } from "react"
import { CalendarCheck, Loader2, Plus, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { addAttendancePoints } from "@/app/admin/points/actions"
import { ManualEventAttendance } from "@/components/admin/manual-event-attendance"
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
  profile_id: string
  full_name: string | null
  reservation_number: string | null
  points: number | null
  marked_at: string | null
}

type AvailableMember = {
  id: string
  full_name: string | null
  reservation_number: string | null
}

export function AttendanceEventMembersSheet({
  name,
  eventDate,
  description,
  members,
  eventId,
  availableMembers,
}: {
  name: string
  eventDate: string
  description?: string | null
  members: AttendanceMember[]
  eventId: string
  availableMembers: AvailableMember[]
}) {
  const router = useRouter()
  const [allPoints, setAllPoints] = useState("")
  const [memberPoints, setMemberPoints] = useState<Record<string, string>>({})
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null)
  const [loadingTarget, setLoadingTarget] = useState<string | null>(null)

  async function addPoints(profileIds: string[], pointsValue: string, target: string) {
    const points = Number(pointsValue)
    if (!Number.isFinite(points) || points <= 0) {
      toast.error("Enter points greater than zero.")
      return
    }
    if (profileIds.length === 0) {
      toast.error("No attendees selected.")
      return
    }

    const formData = new FormData()
    formData.set("points", String(points))
    profileIds.forEach(id => formData.append("profile_ids", id))

    setLoadingTarget(target)
    try {
      const result = await addAttendancePoints(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(`Added ${points} point${points === 1 ? "" : "s"} to ${result.updated || profileIds.length} attendee${(result.updated || profileIds.length) === 1 ? "" : "s"}.`)
        if (target === "all") setAllPoints("")
        else setMemberPoints(current => ({ ...current, [target]: "" }))
        router.refresh()
      }
    } catch {
      toast.error("Could not add points.")
    } finally {
      setLoadingTarget(null)
    }
  }

  const attendeeIds = members.map(member => member.profile_id).filter(Boolean)

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
          <div className="pt-3">
            <ManualEventAttendance eventId={eventId} members={availableMembers} />
          </div>
        </SheetHeader>

        {members.length > 0 ? (
          <div className="flex items-end gap-3 border-b border-slate-100 px-6 py-4">
            <label className="grid flex-1 gap-1.5 text-sm font-bold text-slate-600">
              Add points to all attendees
              <input
                value={allPoints}
                onChange={event => setAllPoints(event.target.value)}
                type="number"
                min="1"
                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-emerald-300 focus:bg-white"
                placeholder="Points"
              />
            </label>
            <button
              type="button"
              onClick={() => addPoints(attendeeIds, allPoints, "all")}
              disabled={loadingTarget === "all"}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingTarget === "all" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </button>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto">
          {members.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm font-bold text-slate-500">
              No members have been marked for this event yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {members.map(member => (
                <div key={member.id}>
                  <button
                    type="button"
                    onClick={() => setActiveMemberId(current => current === member.id ? null : member.id)}
                    className="flex w-full items-center gap-3 px-6 py-4 text-left transition hover:bg-slate-50"
                  >
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
                  </button>
                  <div className={activeMemberId === member.id ? "grid gap-3 bg-slate-50 px-6 pb-4 sm:grid-cols-[1fr_auto]" : "hidden"}>
                    <input
                      value={memberPoints[member.id] || ""}
                      onChange={event => setMemberPoints(current => ({ ...current, [member.id]: event.target.value }))}
                      type="number"
                      min="1"
                      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-300"
                      placeholder={`Points for ${member.full_name || "attendee"}`}
                    />
                    <button
                      type="button"
                      onClick={() => addPoints([member.profile_id], memberPoints[member.id] || "", member.id)}
                      disabled={loadingTarget === member.id}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loadingTarget === member.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      Add Points
                    </button>
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
