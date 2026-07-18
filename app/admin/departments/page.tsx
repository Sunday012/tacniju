import { createClient } from "@/lib/server"
import { DepartmentsManager } from "@/components/admin/departments-manager"
import { isGuestProfile } from "@/lib/profile-kind"

export const dynamic = "force-dynamic"

export default async function AdminDepartmentsPage() {
  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, reservation_number, department, member_role, office_position, rank, district, assembly, email")
    .order("full_name", { ascending: true })

  const memberProfiles = (profiles || []).filter(profile => !isGuestProfile(profile))

  return (
    <main className="mx-auto w-full max-w-[1600px] flex-1 p-5 sm:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Departments</h1>
        <p className="mt-2 font-medium text-slate-500">Create departments, assign members, and choose department heads.</p>
      </div>

      <DepartmentsManager profiles={memberProfiles} />
    </main>
  )
}
