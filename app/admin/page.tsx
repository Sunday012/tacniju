import { AdminOfficeMainMenu } from "@/components/admin/admin-office-menu"
import { getAdminOfficeAccess } from "@/lib/access"
import { createClient } from "@/lib/server"

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from("profiles").select("id, is_admin, department, member_role, email, full_name").eq("id", user.id).maybeSingle()
    : { data: null }
  const access = await getAdminOfficeAccess(profile ? { ...profile, email: profile.email || user?.email } : null)

  return <AdminOfficeMainMenu allowedOfficeSlugs={access.isSuperAdmin ? undefined : access.offices} />
}
