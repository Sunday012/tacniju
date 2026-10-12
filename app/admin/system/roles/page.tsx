import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import { AdminRoleManager } from "@/components/admin/system/AdminRoleManager"
import { getAdminOfficeAccess, getCurrentAccessProfile } from "@/lib/access"

export const dynamic = "force-dynamic"

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createSupabaseAdminClient(url, key)
}

export default async function AdminRolesPage() {
  const { user, profile } = await getCurrentAccessProfile()
  if (!user || !profile) redirect("/auth/admin-login")

  const access = await getAdminOfficeAccess(profile)
  if (!access.canManagePermissions) redirect("/admin")

  const adminSupabase = createAdminClient()
  if (!adminSupabase) {
    return (
      <main className="flex-1 p-5 sm:p-8 lg:p-10">
        <div className="w-full">
          <h1 className="text-3xl font-extrabold text-slate-900">Roles & Permissions</h1>
          <p className="mt-2 text-slate-500">Missing service role configuration.</p>
        </div>
      </main>
    )
  }

  const [{ data: members }, { data: roles }, { data: assignments }] = await Promise.all([
    adminSupabase
      .from("profiles")
      .select("id, full_name, email, reservation_number")
      .order("full_name", { ascending: true }),
    adminSupabase
      .from("admin_roles")
      .select("id, key, name, description, is_wildcard, can_manage_permissions")
      .order("name", { ascending: true }),
    adminSupabase
      .from("admin_user_roles")
      .select("id, profile_id, role_id, created_at")
      .eq("active", true)
      .order("created_at", { ascending: false }),
  ])

  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10">
      <div className="w-full space-y-8">
        <Link href="/admin/system" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-700">
          <ArrowLeft className="h-4 w-4" />
          Back to System
        </Link>

        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center border border-slate-200 bg-white text-indigo-600">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-600">System</p>
              <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Roles & Permissions</h1>
            </div>
          </div>
          <p className="mt-3 max-w-3xl text-slate-500">
            Assign admin roles to existing member accounts. Super Admin has wildcard access; Admin can see the admin areas but does not automatically get action permissions.
          </p>
        </div>

        <AdminRoleManager members={members || []} roles={roles || []} assignments={assignments || []} />
      </div>
    </main>
  )
}
