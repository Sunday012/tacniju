import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { FamiliesManager } from "@/components/admin/families-manager"
import { getFamilies } from "@/app/actions/families"
import { isGuestProfile } from "@/lib/profile-kind"

export default async function FamiliesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
  if (!profile?.is_admin && user.email !== "sundayfavour997@gmail.com") redirect("/")

  const { families } = await getFamilies()
  
  // Fetch profiles for assignment
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, reservation_number, family_id, rank, district, assembly, email")
    .order("full_name")
    .limit(10000)
  const memberProfiles = (profiles || []).filter(profile => !isGuestProfile(profile))

  return (
    <div className="p-6 md:p-10 relative">
      <div className="relative z-10 w-full space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Families Management</h1>
          <p className="text-slate-600 mt-2">Create family groups and assign members to them.</p>
        </div>
        
        <FamiliesManager families={families || []} profiles={memberProfiles} />
      </div>
    </div>
  )
}
