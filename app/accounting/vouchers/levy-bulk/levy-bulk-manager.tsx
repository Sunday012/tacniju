"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CalendarDays, CheckSquare, Loader2, Plus, Search, Square, Users } from "lucide-react"
import { toast } from "sonner"
import { createBulkLevyVoucher } from "./actions"

type MemberOption = {
  id: string
  full_name: string | null
  reservation_number: string | null
  rank: string | null
  district: string | null
  assembly: string | null
  member_role: string | null
  department: string | null
  office_position: string | null
}

type Audience = "all" | "workers" | "executives" | "regular"

const audienceOptions: Array<{ value: Audience; label: string }> = [
  { value: "all", label: "All members" },
  { value: "workers", label: "Workers" },
  { value: "executives", label: "Executives" },
  { value: "regular", label: "Regular members" },
]

function normalize(value: string | null | undefined) {
  return (value || "").toLowerCase()
}

function isExecutive(member: MemberOption) {
  const text = `${member.member_role || ""} ${member.office_position || ""}`.toLowerCase()
  return ["executive", "director", "secretary", "officer", "head", "admin"].some((keyword) => text.includes(keyword))
}

function isWorker(member: MemberOption) {
  const text = `${member.member_role || ""} ${member.office_position || ""} ${member.department || ""}`.toLowerCase()
  return ["worker", "director", "secretary", "officer", "head", "admin", "unit", "ushering", "music", "welfare"].some((keyword) => text.includes(keyword))
}

function matchesAudience(member: MemberOption, audience: Audience) {
  if (audience === "all") return true
  if (audience === "executives") return isExecutive(member)
  if (audience === "workers") return isWorker(member)
  return !isWorker(member) && !isExecutive(member)
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10)
}

export function LevyBulkManager({ members }: { members: MemberOption[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [audience, setAudience] = useState<Audience>("all")
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [levyName, setLevyName] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(todayInputValue())
  const [dueDate, setDueDate] = useState("")

  const filteredMembers = useMemo(() => {
    const term = search.trim().toLowerCase()
    return members.filter((member) => {
      const haystack = [
        member.full_name,
        member.reservation_number,
        member.rank,
        member.district,
        member.assembly,
        member.member_role,
        member.department,
        member.office_position,
      ].map(normalize).join(" ")
      return matchesAudience(member, audience) && (!term || haystack.includes(term))
    })
  }, [audience, members, search])

  const selectedMembers = useMemo(
    () => members.filter((member) => selectedIds.has(member.id)),
    [members, selectedIds]
  )
  const totalAmount = selectedMembers.length * (Number(amount) || 0)
  const allFilteredSelected = filteredMembers.length > 0 && filteredMembers.every((member) => selectedIds.has(member.id))

  function toggleMember(memberId: string) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(memberId)) next.delete(memberId)
      else next.add(memberId)
      return next
    })
  }

  function toggleFilteredMembers() {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (allFilteredSelected) filteredMembers.forEach((member) => next.delete(member.id))
      else filteredMembers.forEach((member) => next.add(member.id))
      return next
    })
  }

  function handleCreate() {
    const formData = new FormData()
    formData.set("levy_name", levyName)
    formData.set("amount", amount)
    formData.set("date", date)
    formData.set("due_date", dueDate)
    selectedMembers.forEach((member) => formData.append("profile_ids", member.id))

    startTransition(async () => {
      const result = await createBulkLevyVoucher(formData)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success(`Created ${result?.voucherNo || "levy voucher"} for ${result?.count || selectedMembers.length} members`)
      setLevyName("")
      setAmount("")
      setSelectedIds(new Set())
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Levy name</span>
            <input
              value={levyName}
              onChange={(event) => setLevyName(event.target.value)}
              className="h-12 border border-slate-200 bg-white px-4 text-base outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950"
              placeholder="e.g. Convention levy"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Amount per member</span>
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              type="number"
              min="0"
              step="0.01"
              className="h-12 border border-slate-200 bg-white px-4 text-base outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950"
              placeholder="0.00"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Date</span>
            <div className="flex h-12 items-center gap-2 border border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              <input
                value={date}
                onChange={(event) => setDate(event.target.value)}
                type="date"
                className="min-w-0 flex-1 bg-transparent text-base outline-none"
              />
            </div>
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Due date</span>
            <div className="flex h-12 items-center gap-2 border border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              <input
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                type="date"
                className="min-w-0 flex-1 bg-transparent text-base outline-none"
              />
            </div>
          </label>
        </div>
        <div className="flex flex-col justify-between border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Selected</p>
            <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{selectedMembers.length}</p>
            <p className="mt-1 text-sm text-slate-500">Total receivable: <span className="font-black text-slate-900 dark:text-slate-100">NGN {totalAmount.toLocaleString()}</span></p>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={isPending || !levyName.trim() || !Number(amount) || selectedMembers.length === 0}
            className="mt-5 inline-flex h-12 items-center justify-center gap-2 bg-indigo-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create Levy Voucher
          </button>
        </div>
      </section>

      <section className="border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="grid gap-3 border-b border-slate-200 p-4 dark:border-slate-800 md:grid-cols-[220px_1fr_auto]">
          <select
            value={audience}
            onChange={(event) => setAudience(event.target.value as Audience)}
            className="h-11 border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950"
          >
            {audienceOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <div className="flex h-11 items-center gap-2 border border-slate-200 px-3 dark:border-slate-800">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              placeholder="Search name, reservation, role, department..."
            />
          </div>
          <button
            type="button"
            onClick={toggleFilteredMembers}
            className="inline-flex h-11 items-center justify-center gap-2 border border-slate-200 px-4 text-sm font-black text-slate-800 transition hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-800 dark:text-slate-100"
          >
            {allFilteredSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
            {allFilteredSelected ? "Clear shown" : "Select shown"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.08em] text-slate-500 dark:bg-slate-900">
              <tr>
                <th className="w-14 px-5 py-4"></th>
                <th className="px-5 py-4">Member</th>
                <th className="px-5 py-4">Reservation</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Department</th>
                <th className="px-5 py-4">Assembly</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMembers.map((member) => {
                const checked = selectedIds.has(member.id)
                return (
                  <tr key={member.id} className={checked ? "bg-indigo-50/70 dark:bg-indigo-950/30" : ""}>
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleMember(member.id)}
                        className="h-5 w-5 accent-indigo-600"
                        aria-label={`Select ${member.full_name || "member"}`}
                      />
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-slate-100">{member.full_name || "Unnamed member"}</td>
                    <td className="px-5 py-4 font-mono text-sm text-slate-600 dark:text-slate-300">{member.reservation_number || "-"}</td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{member.office_position || member.member_role || member.rank || "Member"}</td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{member.department || "-"}</td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{member.assembly || "-"}</td>
                  </tr>
                )
              })}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center text-slate-500">
                    <Users className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                    No members matched this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex justify-end">
        <Link href="/accounting/vouchers/levy" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
          Create one levy manually
        </Link>
      </div>
    </div>
  )
}
