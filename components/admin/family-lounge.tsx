"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Crown, Shield, Users, Loader2, UserMinus, Printer } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { setFamilyHeadAction, assignMemberToFamilyAction } from "@/app/actions/families"
import { toast } from "sonner"

type Member = {
  id: string
  full_name: string
  reservation_number?: string | null
  avatar_url?: string | null
  rank?: string | null
  department?: string | null
  office_position?: string | null
  member_role?: string | null
}

type Family = {
  id: string
  name: string
  head_id?: string | null
}

interface Props {
  family: Family
  members: Member[]
  head: Member | null
  isAdmin?: boolean
}

export function FamilyLounge({ family, members, head, isAdmin = false }: Props) {
  const [savingHead, setSavingHead] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [selectedHead, setSelectedHead] = useState<string>(family.head_id || "none")

  const handleSaveHead = async (value: string) => {
    setSelectedHead(value)
    setSavingHead(true)
    const res = await setFamilyHeadAction(family.id, value === "none" ? null : value)
    setSavingHead(false)
    if (res.success) {
      toast.success(value === "none" ? "Family head cleared" : "Family head updated")
    } else {
      toast.error(res.error || "Could not update head")
      setSelectedHead(family.head_id || "none")
    }
  }

  const handleRemove = async (memberId: string) => {
    if (!confirm("Remove this member from the family?")) return
    setRemovingId(memberId)
    const res = await assignMemberToFamilyAction(memberId, null)
    setRemovingId(null)
    if (res.success) toast.success("Member removed from family")
    else toast.error(res.error || "Could not remove member")
  }

  const sortedMembers = [...members].sort((a, b) => {
    if (a.id === family.head_id) return -1
    if (b.id === family.head_id) return 1
    return 0
  })

  return (
    <div className="space-y-8 print:space-y-4">
      {/* Hero / Family Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 p-8 sm:p-10 shadow-[0_20px_40px_-15px_rgba(49,46,129,0.4)] border border-indigo-700/40 print:bg-white print:bg-none print:border-slate-200 print:shadow-none print:p-4">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 opacity-10 pointer-events-none print:hidden">
          <Shield className="w-72 h-72 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg print:bg-indigo-50 print:border-indigo-100 print:shadow-none">
              <Shield className="w-8 h-8 text-white print:text-indigo-700" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/80 text-[10px] font-bold tracking-widest uppercase mb-2 print:bg-slate-100 print:border-slate-200 print:text-slate-600">
                Family Lounge
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight print:text-slate-900">{family.name}</h1>
              <p className="text-indigo-200/80 text-sm mt-1.5 print:text-slate-600">
                {members.length} {members.length === 1 ? "member" : "members"}
                {head && <> · Led by <span className="font-semibold text-white print:text-slate-900">{head.full_name}</span></>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {head && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-400/15 border border-amber-300/30 backdrop-blur-md print:bg-amber-50 print:border-amber-200">
                <Crown className="w-5 h-5 text-amber-300 print:text-amber-600" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200/90 print:text-amber-700">Family Head</p>
                  <p className="text-sm font-bold text-white print:text-slate-900">{head.full_name}</p>
                </div>
              </div>
            )}
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-semibold transition-colors backdrop-blur-md print:hidden"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Admin: set head */}
      {isAdmin && (
        <Card className="border-indigo-100 shadow-sm print:hidden">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-800">Assign Family Head</h3>
                <p className="text-xs text-slate-500">The head is picked from members already in this family.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedHead} onValueChange={handleSaveHead} disabled={savingHead || members.length === 0}>
                <SelectTrigger className="w-[260px]">
                  <SelectValue placeholder={members.length === 0 ? "No members yet" : "Select family head"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Clear head —</SelectItem>
                  {members.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {savingHead && <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members grid */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100">
            <Users className="w-5 h-5 text-indigo-700" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">Members</h2>
        </div>

        {members.length === 0 ? (
          <Card className="bg-slate-50/50 border-dashed border-slate-200">
            <CardContent className="py-12 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No members in this family yet.</p>
              {isAdmin && (
                <p className="text-slate-400 text-xs mt-1">Assign members from the families page.</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3 font-bold text-slate-600 text-[11px] uppercase tracking-wider">Member</th>
                    <th className="px-5 py-3 font-bold text-slate-600 text-[11px] uppercase tracking-wider hidden md:table-cell">Role</th>
                    <th className="px-5 py-3 font-bold text-slate-600 text-[11px] uppercase tracking-wider hidden md:table-cell">Department</th>
                    <th className="px-5 py-3 font-bold text-slate-600 text-[11px] uppercase tracking-wider hidden lg:table-cell">Office</th>
                    <th className="px-5 py-3 font-bold text-slate-600 text-[11px] uppercase tracking-wider hidden sm:table-cell">Rank</th>
                    {isAdmin && (
                      <th className="px-5 py-3 font-bold text-slate-600 text-[11px] uppercase tracking-wider text-right print:hidden">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {members.map(m => {
                    const isHead = m.id === family.head_id
                    return (
                      <tr key={m.id} className={`transition-colors ${isHead ? "bg-amber-50/40 hover:bg-amber-50/60" : "hover:bg-slate-50/60"}`}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className={`h-9 w-9 border-2 shrink-0 ${isHead ? "border-amber-300" : "border-indigo-50"}`}>
                              <AvatarImage src={m.avatar_url || ""} />
                              <AvatarFallback className={isHead ? "bg-amber-100 text-amber-800 font-bold text-xs" : "bg-indigo-100 text-indigo-700 font-bold text-xs"}>
                                {m.full_name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 truncate">{m.full_name}</span>
                                {isHead && (
                                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[9px] font-bold tracking-wider uppercase shrink-0">
                                    <Crown className="w-2.5 h-2.5 mr-1" /> Head
                                  </Badge>
                                )}
                              </div>
                              {m.reservation_number && (
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{m.reservation_number}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 hidden md:table-cell text-slate-600 text-xs">
                          {m.member_role || <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-5 py-3 hidden md:table-cell text-slate-600 text-xs">
                          {m.department || <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-5 py-3 hidden lg:table-cell text-indigo-700 text-xs font-semibold">
                          {m.office_position || <span className="text-slate-300 font-normal">—</span>}
                        </td>
                        <td className="px-5 py-3 hidden sm:table-cell text-slate-600 text-xs">
                          {m.rank || <span className="text-slate-300">—</span>}
                        </td>
                        {isAdmin && (
                          <td className="px-5 py-3 text-right">
                            <button
                              onClick={() => handleRemove(m.id)}
                              disabled={removingId === m.id}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {removingId === m.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <UserMinus className="w-3.5 h-3.5" />}
                              <span className="hidden sm:inline">Remove</span>
                            </button>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
