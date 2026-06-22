"use client"

import { useState } from "react"
import { Loader2, Trash2, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deletePointWorkRecord } from "@/app/admin/points/actions"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type PointWorkMember = {
  record_id: string
  profile_id: string
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
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const signedPoints = `${mode === "remove" ? "-" : "+"}${points}`

  async function handleDeleteMember(recordId: string, name: string) {
    if (!window.confirm(`Remove ${name} from this work and reverse their points?`)) return

    setDeletingId(recordId)
    try {
      const result = await deletePointWorkRecord(recordId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Member removed from work.")
        router.refresh()
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setDeletingId(null)
    }
  }

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
                <div key={member.record_id} className="flex items-center gap-3 px-6 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-600">
                    {(member.full_name || "U").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black text-slate-800">{member.full_name || "Unnamed"}</div>
                    <div className="mt-0.5 text-xs font-bold text-slate-400">
                      {member.reservation_number || "-"} · {member.points || 0} pts
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteMember(member.record_id, member.full_name || "this member")}
                    disabled={deletingId === member.record_id}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Remove member from work"
                  >
                    {deletingId === member.record_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
