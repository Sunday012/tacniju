"use client"

import { useMemo, useState } from "react"
import { Building2, Crown, Plus, Users } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { setMemberDepartmentHeadAction, setMemberDepartmentMembershipAction } from "@/app/actions/departments"

type DepartmentMember = {
  id: string
  full_name: string | null
  reservation_number?: string | null
  department?: string | null
  departments?: string[]
  head_departments?: string[]
  member_role?: string | null
  office_position?: string | null
}

const defaultDepartments = ["Music", "Ushering", "Admin Unit", "Account Unit", "Welfare"]

export function DepartmentsManager({ profiles }: { profiles: DepartmentMember[] }) {
  const [departmentNames, setDepartmentNames] = useState<string[]>(() => {
    const existing = profiles.flatMap(profile => profile.departments?.length ? profile.departments : (profile.department ? [profile.department] : []))
    return Array.from(new Set([...defaultDepartments, ...existing])).sort()
  })
  const [newDepartmentName, setNewDepartmentName] = useState("")
  const [isAssigning, setIsAssigning] = useState<string | null>(null)
  const [isSettingHead, setIsSettingHead] = useState<string | null>(null)

  const departments = useMemo(() => departmentNames.map(name => {
    const members = profiles.filter(profile => (profile.departments || []).includes(name))
    const heads = members.filter(member => (member.head_departments || []).includes(name))
    const head = heads[0] || null
    return { name, members, head, heads }
  }), [departmentNames, profiles])

  const unassignedCount = profiles.filter(profile => !(profile.departments || []).length).length

  function handleCreate() {
    const name = newDepartmentName.trim()
    if (!name) return
    if (departmentNames.some(department => department.toLowerCase() === name.toLowerCase())) {
      toast.error("Department already exists.")
      return
    }
    setDepartmentNames(previous => [...previous, name].sort())
    setNewDepartmentName("")
    toast.success("Department added. Assign a member to save it.")
  }

  async function handleAssign(profileId: string, department: string, assigned: boolean) {
    setIsAssigning(`${profileId}-${department}`)
    const result = await setMemberDepartmentMembershipAction(profileId, department, assigned)
    setIsAssigning(null)
    if (!result.success) {
      toast.error(result.error || "Failed to assign department")
      return
    }
    toast.success(assigned ? "Member assigned to department" : "Member removed from department")
  }

  async function handleSetHead(profileId: string, department: string, isHead: boolean) {
    setIsSettingHead(`${profileId}-${department}`)
    const result = await setMemberDepartmentHeadAction(profileId, department, isHead)
    setIsSettingHead(null)
    if (!result.success) {
      toast.error(result.error || "Failed to set department head")
      return
    }
    toast.success(isHead ? "Department head assigned" : "Department head cleared")
  }

  return (
    <div className="space-y-8">
      <Card className="border-indigo-100 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="border-b border-indigo-50 bg-indigo-50/50 pb-4 dark:border-slate-800 dark:bg-slate-900">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
            <Building2 className="h-5 w-5 text-indigo-600" />
            Department Groups
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <Input
              value={newDepartmentName}
              onChange={event => setNewDepartmentName(event.target.value)}
              placeholder="New department name..."
              className="max-w-xs"
            />
            <Button onClick={handleCreate} disabled={!newDepartmentName.trim()} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-1 h-4 w-4" />
              Add Department
            </Button>
            <Badge variant="outline" className="ml-auto border-slate-200 px-3 py-1.5 text-slate-500 dark:border-slate-700 dark:text-slate-300">
              {unassignedCount} unassigned
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {departments.map(department => (
              <div key={department.name} className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="flex items-center gap-2 truncate font-bold text-slate-800 dark:text-slate-100">
                      <Building2 className="h-4 w-4 text-indigo-500" />
                      {department.name}
                    </h3>
                    <Badge variant="secondary" className="mt-2 border border-indigo-100 bg-indigo-50 text-xs text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
                      {department.members.length} {department.members.length === 1 ? "Member" : "Members"}
                    </Badge>
                  </div>
                  <Crown className={`h-4 w-4 ${department.heads.length ? "text-amber-500" : "text-slate-300"}`} />
                </div>
                <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  Heads: <span className="font-semibold text-slate-700 dark:text-slate-200">{department.heads.map(member => member.full_name || "Unnamed").join(", ") || "Not assigned"}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 dark:border-slate-800 dark:bg-slate-900">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
            <Users className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            Assign Members to Departments
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[620px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                <tr>
                  <th className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-300">Member</th>
                  <th className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-300">Departments</th>
                  <th className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-300">Head Of</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {profiles.map(profile => (
                  <tr key={profile.id} className="hover:bg-slate-50 dark:hover:bg-slate-950">
                    <td className="px-6 py-3">
                      <div className="font-medium text-slate-800 dark:text-slate-100">{profile.full_name || "Unnamed Member"}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{profile.reservation_number || "No Res #"}</div>
                    </td>
                    <td className="px-6 py-3">
                      {(profile.departments || []).length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {(profile.departments || []).map(department => (
                            <Badge key={department} className="border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">{department}</Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs italic text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="grid gap-2 sm:grid-cols-2">
                        {departmentNames.map(department => {
                          const checked = (profile.departments || []).includes(department)
                          const headChecked = (profile.head_departments || []).includes(department)
                          return (
                            <label key={department} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                              <input type="checkbox" checked={checked} disabled={isAssigning === `${profile.id}-${department}`} onChange={event => handleAssign(profile.id, department, event.target.checked)} />
                              {department}
                              <button type="button" disabled={isSettingHead === `${profile.id}-${department}`} onClick={() => handleSetHead(profile.id, department, !headChecked)} className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-black ${headChecked ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                                Head
                              </button>
                            </label>
                          )
                        })}
                      </div>
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
