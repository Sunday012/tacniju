"use client"

import { useMemo, useState } from "react"
import { Building2, Crown, Plus, Users } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { assignMemberToDepartmentAction, setDepartmentHeadAction } from "@/app/actions/departments"

type DepartmentMember = {
  id: string
  full_name: string | null
  reservation_number?: string | null
  department?: string | null
  member_role?: string | null
  office_position?: string | null
}

const defaultDepartments = ["Music", "Ushering", "Admin Unit", "Account Unit", "Welfare"]

export function DepartmentsManager({ profiles }: { profiles: DepartmentMember[] }) {
  const [departmentNames, setDepartmentNames] = useState<string[]>(() => {
    const existing = profiles.map(profile => profile.department).filter(Boolean) as string[]
    return Array.from(new Set([...defaultDepartments, ...existing])).sort()
  })
  const [newDepartmentName, setNewDepartmentName] = useState("")
  const [isAssigning, setIsAssigning] = useState<string | null>(null)
  const [isSettingHead, setIsSettingHead] = useState<string | null>(null)

  const departments = useMemo(() => departmentNames.map(name => {
    const members = profiles.filter(profile => profile.department === name)
    const headTitle = `${name} Head`
    const head = members.find(member => member.office_position === headTitle) || null
    return { name, members, head }
  }), [departmentNames, profiles])

  const unassignedCount = profiles.filter(profile => !profile.department).length

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

  async function handleAssign(profileId: string, department: string | null) {
    setIsAssigning(profileId)
    const result = await assignMemberToDepartmentAction(profileId, department)
    setIsAssigning(null)
    if (!result.success) {
      toast.error(result.error || "Failed to assign department")
      return
    }
    toast.success(department ? "Member assigned to department" : "Member removed from department")
  }

  async function handleSetHead(department: string, profileId: string | null) {
    setIsSettingHead(department)
    const result = await setDepartmentHeadAction(department, profileId)
    setIsSettingHead(null)
    if (!result.success) {
      toast.error(result.error || "Failed to set department head")
      return
    }
    toast.success(profileId ? "Department head assigned" : "Department head cleared")
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
                  <Crown className={`h-4 w-4 ${department.head ? "text-amber-500" : "text-slate-300"}`} />
                </div>
                <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  Head: <span className="font-semibold text-slate-700 dark:text-slate-200">{department.head?.full_name || "Not assigned"}</span>
                </div>
                <div className="mt-3">
                  <Select
                    value={department.head?.id || "none"}
                    onValueChange={value => handleSetHead(department.name, value === "none" ? null : value)}
                    disabled={isSettingHead === department.name}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select department head" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- No head --</SelectItem>
                      {profiles.map(profile => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.full_name || "Unnamed Member"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <th className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-300">Current Department</th>
                  <th className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-300">Assign</th>
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
                      {profile.department ? (
                        <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
                          {profile.department}
                        </Badge>
                      ) : (
                        <span className="text-xs italic text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <Select
                        value={profile.department || "none"}
                        onValueChange={value => handleAssign(profile.id, value === "none" ? null : value)}
                        disabled={isAssigning === profile.id || departmentNames.length === 0}
                      >
                        <SelectTrigger className="h-8 w-[210px] text-xs">
                          <SelectValue placeholder="Select department..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- Unassign --</SelectItem>
                          {departmentNames.map(department => (
                            <SelectItem key={department} value={department}>{department}</SelectItem>
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
