"use client"
import { useState } from "react"
import { Users, Plus, Trash2, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { createFamilyAction, deleteFamilyAction, assignMemberToFamilyAction } from "@/app/actions/families"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function FamiliesManager({ families, profiles }: { families: any[], profiles: any[] }) {
  const [newFamilyName, setNewFamilyName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isAssigning, setIsAssigning] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!newFamilyName.trim()) return
    setIsCreating(true)
    const res = await createFamilyAction(newFamilyName)
    setIsCreating(false)
    if (res.success) {
      toast.success("Family created successfully!")
      setNewFamilyName("")
    } else {
      toast.error(res.error || "Failed to create family")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? Members will be removed from this family.")) return
    setIsDeleting(id)
    const res = await deleteFamilyAction(id)
    setIsDeleting(null)
    if (res.success) {
      toast.success("Family deleted")
    } else {
      toast.error(res.error || "Failed to delete")
    }
  }

  const handleAssign = async (profileId: string, familyId: string | null) => {
    setIsAssigning(profileId)
    const res = await assignMemberToFamilyAction(profileId, familyId)
    setIsAssigning(null)
    if (res.success) {
      toast.success("Member assigned to family")
    } else {
      toast.error(res.error || "Failed to assign")
    }
  }

  return (
    <div className="space-y-8">
      {/* Families List */}
      <Card className="border-indigo-100 shadow-sm">
        <CardHeader className="bg-indigo-50/50 pb-4 border-b border-indigo-50">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Family Groups
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-2 mb-6">
            <Input 
              value={newFamilyName} 
              onChange={e => setNewFamilyName(e.target.value)} 
              placeholder="New family name..." 
              className="max-w-xs"
            />
            <Button onClick={handleCreate} disabled={isCreating || !newFamilyName.trim()} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-1" />
              Add Family
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {families.length === 0 ? (
              <p className="text-slate-500 text-sm italic col-span-full">No families created yet.</p>
            ) : families.map(f => {
              const count = profiles.filter(p => p.family_id === f.id).length
              return (
                <div key={f.id} className="border border-slate-200 rounded-xl p-4 bg-white hover:border-indigo-200 transition-colors flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-indigo-500" />
                      {f.name}
                    </h3>
                    <Badge variant="secondary" className="mt-2 text-xs bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {count} Members
                    </Badge>
                  </div>
                  <button 
                    onClick={() => handleDelete(f.id)}
                    disabled={isDeleting === f.id}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Member Assignment */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-600" />
            Assign Members to Families
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white sticky top-0 border-b border-slate-200 shadow-sm z-10">
                <tr>
                  <th className="px-6 py-3 font-semibold text-slate-600">Member</th>
                  <th className="px-6 py-3 font-semibold text-slate-600">Current Family</th>
                  <th className="px-6 py-3 font-semibold text-slate-600">Assign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profiles.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3">
                      <div className="font-medium text-slate-800">{p.full_name}</div>
                      <div className="text-xs text-slate-500">{p.reservation_number || "No Res #"}</div>
                    </td>
                    <td className="px-6 py-3">
                      {p.family_id ? (
                        <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">
                          {families.find(f => f.id === p.family_id)?.name || "Unknown"}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <Select
                        value={p.family_id || "none"}
                        onValueChange={(val) => handleAssign(p.id, val === "none" ? null : val)}
                        disabled={isAssigning === p.id || families.length === 0}
                      >
                        <SelectTrigger className="w-[180px] h-8 text-xs">
                          <SelectValue placeholder={families.length === 0 ? "Create a family first" : "Select family..."} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- Unassign --</SelectItem>
                          {families.map(f => (
                            <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
