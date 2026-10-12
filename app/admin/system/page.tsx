import { createClient } from "@/lib/server"
import { AdminCleanup } from "@/components/admin-cleanup"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { getAdminOfficeAccess } from "@/lib/access"

export default async function AdminSystemPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  const { data: profile } = await supabase.from("profiles").select("id, is_admin, department, member_role, email, full_name").eq("id", user.id).maybeSingle()
  const access = await getAdminOfficeAccess(profile ? { ...profile, email: profile.email || user.email } : null)
  if (!access.isSuperAdmin && !access.canManagePermissions) redirect("/")

  return (
    <div className="p-6 md:p-10 relative">
      <div className="relative z-10 w-full space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">System Management</h1>
          <p className="text-slate-600 mt-2">Manage backend system tasks, cleanups, and administrative actions.</p>
        </div>
        <div className="border border-slate-200 bg-white p-4 shadow-sm">
          <Link href="/admin/system/roles" className="flex min-h-14 items-center gap-3 border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-indigo-300 hover:bg-slate-50 hover:shadow-md">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-slate-200 bg-slate-50 text-indigo-600">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold text-slate-800 sm:text-base">Roles & Permissions</span>
          </Link>
        </div>
        <AdminCleanup />
      </div>
    </div>
  )
}
