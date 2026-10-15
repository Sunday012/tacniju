"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Search, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { markManualEventAttendance } from "@/app/admin/events/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"

type Member = {
  id: string
  full_name: string | null
  reservation_number: string | null
}

export function ManualEventAttendance({ eventId, members }: { eventId: string; members: Member[] }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const visibleMembers = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return members
    return members.filter((member) => `${member.full_name || ""} ${member.reservation_number || ""}`.toLowerCase().includes(term))
  }, [members, query])

  const markPresent = (profileId: string) => {
    startTransition(async () => {
      const result = await markManualEventAttendance(eventId, profileId)
      if (!result.success) {
        toast.error(result.message || "Could not mark attendance.")
        return
      }
      toast.success("Member marked present.")
      setOpen(false)
      setQuery("")
      router.refresh()
    })
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-indigo-600 font-bold text-white hover:bg-indigo-700">
        <UserPlus className="mr-2 h-4 w-4" />
        Mark Member Present
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full p-0 sm:max-w-xl">
          <SheetHeader className="border-b px-6 py-5 text-left">
            <SheetTitle>Mark Member Present</SheetTitle>
            <SheetDescription>Search the member register and add a person to this event attendance.</SheetDescription>
          </SheetHeader>
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or reservation number" className="pl-9" autoFocus />
            </div>
            <div className="mt-4 h-[min(60dvh,32rem)] divide-y overflow-y-auto overscroll-contain border">
              {visibleMembers.map((member) => (
                <button key={member.id} type="button" disabled={pending} onClick={() => markPresent(member.id)} className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-indigo-50 disabled:opacity-50">
                  <span className="font-bold text-slate-900">{member.full_name || "Unnamed member"}</span>
                  <span className="shrink-0 text-sm text-slate-500">{member.reservation_number || "No reservation no."}</span>
                </button>
              ))}
              {!visibleMembers.length && <p className="px-4 py-10 text-center text-sm text-slate-500">No matching members found.</p>}
              {pending && <div className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-indigo-700"><Loader2 className="h-4 w-4 animate-spin" />Saving attendance...</div>}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
