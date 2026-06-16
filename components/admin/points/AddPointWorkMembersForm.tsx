"use client"

import { type FormEvent, useMemo, useState } from "react"
import { Loader2, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { addMembersToPointWork } from "@/app/admin/points/actions"

type WorkOption = {
  id: string
  title: string
  points: number
  mode: "add" | "remove"
}

type MemberOption = {
  id: string
  full_name: string | null
  reservation_number: string | null
  points: number | null
}

export function AddPointWorkMembersForm({
  works,
  members,
}: {
  works: WorkOption[]
  members: MemberOption[]
}) {
  const router = useRouter()
  const [workId, setWorkId] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)

  const filteredMembers = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return members
    return members.filter(member => {
      const name = member.full_name?.toLowerCase() || ""
      const reservation = member.reservation_number?.toLowerCase() || ""
      return name.includes(search) || reservation.includes(search)
    })
  }, [members, query])

  function toggleMember(memberId: string) {
    setSelectedIds(current => current.includes(memberId) ? current.filter(id => id !== memberId) : [...current, memberId])
  }

  function toggleVisibleMembers() {
    const visibleIds = filteredMembers.map(member => member.id)
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id))
    if (allVisibleSelected) {
      setSelectedIds(current => current.filter(id => !visibleIds.includes(id)))
    } else {
      setSelectedIds(current => Array.from(new Set([...current, ...visibleIds])))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!workId) {
      toast.error("Select a work.")
      return
    }
    if (selectedIds.length === 0) {
      toast.error("Select at least one member.")
      return
    }

    const formData = new FormData()
    formData.set("work_id", workId)
    selectedIds.forEach(id => formData.append("profile_ids", id))

    setLoading(true)
    try {
      const result = await addMembersToPointWork(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(`${result.added || selectedIds.length} member(s) added.`)
        setSelectedIds([])
        router.refresh()
      }
    } catch {
      toast.error("Could not add members.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-4 border-b border-slate-100 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <label className="grid gap-1.5 text-sm font-bold text-slate-600">
          Work
          <select
            value={workId}
            onChange={event => setWorkId(event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white"
          >
            <option value="">Select work</option>
            {works.map(work => (
              <option key={work.id} value={work.id}>
                {work.title} ({work.mode === "remove" ? "-" : "+"}{work.points})
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-slate-600">
          Search members
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white"
            placeholder="Name or reservation"
          />
        </label>
        <button
          disabled={loading || works.length === 0 || selectedIds.length === 0}
          className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-black text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
          Add {selectedIds.length || ""} Member{selectedIds.length === 1 ? "" : "s"}
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-3">
        <p className="text-sm font-bold text-slate-500">{selectedIds.length} selected</p>
        <button type="button" onClick={toggleVisibleMembers} className="text-sm font-black text-indigo-600 hover:text-indigo-700">
          Select visible
        </button>
      </div>

      <div className="max-h-[620px] overflow-y-auto">
        {filteredMembers.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm font-bold text-slate-500">No members found.</div>
        ) : filteredMembers.map(member => (
          <label key={member.id} className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-6 py-3 hover:bg-slate-50">
            <input
              type="checkbox"
              checked={selectedIds.includes(member.id)}
              onChange={() => toggleMember(member.id)}
              className="h-4 w-4"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-black text-slate-800">{member.full_name || "Unnamed"}</span>
              <span className="block text-xs font-bold text-slate-400">{member.reservation_number || "-"} · {member.points || 0} pts</span>
            </span>
          </label>
        ))}
      </div>
    </form>
  )
}
