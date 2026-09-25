import { createClient } from "@/lib/server"
import { DepartmentsManager } from "@/components/admin/departments-manager"
import { isGuestProfile } from "@/lib/profile-kind"
import { getDepartmentAssignments } from "@/app/actions/departments"

export const dynamic = "force-dynamic"

export default async function AdminDepartmentsPage() {
  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, reservation_number, department, member_role, office_position, rank, district, assembly, email")
    .order("full_name", { ascending: true })

  const { rows: assignments } = await getDepartmentAssignments()
  const assignmentMap = assignments.reduce((map, row) => {
    const current = map.get(row.profile_id) || { departments: [] as string[], headDepartments: [] as string[] }
    current.departments.push(row.department)
    if (row.is_head) current.headDepartments.push(row.department)
    map.set(row.profile_id, current)
    return map
  }, new Map<string, { departments: string[]; headDepartments: string[] }>())
  const memberProfiles = (profiles || []).filter(profile => !isGuestProfile(profile)).map(profile => {
    const assignment = assignmentMap.get(profile.id)
    return {
      ...profile,
      departments: assignment?.departments?.length ? assignment.departments : (profile.department ? [profile.department] : []),
      head_departments: assignment?.headDepartments?.length ? assignment.headDepartments : (profile.office_position && profile.department && profile.office_position === `${profile.department} Head` ? [profile.department] : []),
    }
  })

  return (
    <main className="w-full flex-1 p-5 sm:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Departments</h1>
        <p className="mt-2 font-medium text-slate-500">Create departments, assign members, and choose department heads.</p>
      </div>

      <DepartmentsManager profiles={memberProfiles} />
    </main>
  )
}
