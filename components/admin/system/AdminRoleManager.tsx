"use client"

import { useTransition } from "react"
import { ShieldCheck, UserPlus, XCircle } from "lucide-react"
import { toast } from "sonner"
import { assignAdminRole, revokeAdminRole } from "@/app/admin/system/roles/actions"

type MemberRow = {
  id: string
  full_name: string | null
  email: string | null
  reservation_number: string | null
}

type RoleRow = {
  id: string
  key: string
  name: string
  description: string | null
  is_wildcard: boolean | null
  can_manage_permissions: boolean | null
}

type AssignmentRow = {
  id: string
  profile_id: string
  role_id: string
  created_at: string
}

export function AdminRoleManager({
  members,
  roles,
  assignments,
}: {
  members: MemberRow[]
  roles: RoleRow[]
  assignments: AssignmentRow[]
}) {
  const [isPending, startTransition] = useTransition()
  const membersById = new Map(members.map((member) => [member.id, member]))
  const rolesById = new Map(roles.map((role) => [role.id, role]))

  function handleAssign(formData: FormData) {
    startTransition(async () => {
      const result = await assignAdminRole(formData)
      if (result?.error) toast.error(result.error)
      else toast.success("Admin role assigned.")
    })
  }

  function handleRevoke(formData: FormData) {
    startTransition(async () => {
      const result = await revokeAdminRole(formData)
      if (result?.error) toast.error(result.error)
      else toast.success("Admin role revoked.")
    })
  }

  return (
    <div className="space-y-6">
      <form action={handleAssign} className="border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-slate-200 bg-slate-50 text-indigo-600">
            <UserPlus className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Assign Admin Access</h2>
            <p className="text-sm text-slate-500">Give an existing member account an admin role.</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
          <select name="profile_id" className="h-12 border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-400">
            <option value="">Select member</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.full_name || member.email || "Unnamed member"}{member.reservation_number ? ` (${member.reservation_number})` : ""}
              </option>
            ))}
          </select>
          <select name="role_id" className="h-12 border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-400">
            <option value="">Select role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          <button disabled={isPending} className="inline-flex h-12 items-center justify-center gap-2 bg-indigo-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
            <ShieldCheck className="h-4 w-4" />
            Assign Role
          </button>
        </div>
      </form>

      <div className="border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <h2 className="text-lg font-extrabold text-slate-900">Current Admin Roles</h2>
          <p className="text-sm text-slate-500">Active role assignments for member accounts.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Access</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.map((assignment) => {
                const member = membersById.get(assignment.profile_id)
                const role = rolesById.get(assignment.role_id)
                return (
                  <tr key={assignment.id}>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{member?.full_name || member?.email || "Unknown member"}</p>
                      <p className="text-xs text-slate-500">{member?.reservation_number || member?.email || assignment.profile_id}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800">{role?.name || "Unknown role"}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {role?.is_wildcard ? "All admin areas and actions" : role?.can_manage_permissions ? "Can manage permissions" : role?.description || "Area access"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form action={handleRevoke}>
                        <input type="hidden" name="assignment_id" value={assignment.id} />
                        <button disabled={isPending} className="inline-flex h-9 items-center justify-center gap-2 border border-red-200 bg-red-50 px-3 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60">
                          <XCircle className="h-4 w-4" />
                          Revoke
                        </button>
                      </form>
                    </td>
                  </tr>
                )
              })}
              {!assignments.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm font-semibold text-slate-400">
                    No member has been assigned an admin role yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
