"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Crown, Shield, Users, Loader2, UserMinus } from "lucide-react"
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

  return (
    <div className="space-y-8">
      {/* Hero / Family Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 p-8 sm:p-10 shadow-[0_20px_40px_-15px_rgba(49,46,129,0.4)] border border-indigo-700/40">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 opacity-10 pointer-events-none">
          <Shield className="w-72 h-72 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/80 text-[10px] font-bold tracking-widest uppercase mb-2">
                Family Lounge
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{family.name}</h1>
              <p className="text-indigo-200/80 text-sm mt-1.5">
                {members.length} {members.length === 1 ? "member" : "members"}
                {head && <> · Led by <span className="font-semibold text-white">{head.full_name}</span></>}
              </p>
            </div>
          </div>

          {head && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-400/15 border border-amber-300/30 backdrop-blur-md">
              <Crown className="w-5 h-5 text-amber-300" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200/90">Family Head</p>
                <p className="text-sm font-bold text-white">{head.full_name}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin: set head */}
      {isAdmin && (
        <Card className="border-indigo-100 shadow-sm">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {members.map(m => {
              const isHead = m.id === family.head_id
              return (
                <Card
                  key={m.id}
                  className={`bg-white border transition-all duration-300 hover:shadow-md ${
                    isHead ? "border-amber-300 shadow-[0_8px_30px_-12px_rgba(245,158,11,0.35)]" : "border-slate-100"
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className={`h-14 w-14 border-2 ${isHead ? "border-amber-300" : "border-indigo-50"}`}>
                        <AvatarImage src={m.avatar_url || ""} />
                        <AvatarFallback className={isHead ? "bg-amber-100 text-amber-800 font-bold" : "bg-indigo-100 text-indigo-700 font-bold"}>
                          {m.full_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-800 leading-tight truncate">{m.full_name}</h3>
                          {isHead && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-bold tracking-wider uppercase">
                              <Crown className="w-3 h-3 mr-1" /> Head
                            </Badge>
                          )}
                        </div>
                        {m.office_position && (
                          <p className="text-xs font-semibold text-indigo-700 mt-0.5">{m.office_position}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {m.rank && <Badge variant="outline" className="text-[10px]">{m.rank}</Badge>}
                          {m.department && <Badge variant="outline" className="text-[10px]">{m.department}</Badge>}
                          {m.member_role && <Badge variant="outline" className="text-[10px]">{m.member_role}</Badge>}
                        </div>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                        <button
                          onClick={() => handleRemove(m.id)}
                          disabled={removingId === m.id}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {removingId === m.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <UserMinus className="w-3.5 h-3.5" />}
                          Remove
                        </button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
