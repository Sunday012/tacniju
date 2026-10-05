import { AdminTopBar } from "@/components/admin/top-bar"
import { getAdminOfficeAccess } from "@/lib/access"
import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/admin-login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_admin, department, member_role, email, full_name")
    .eq("id", user.id)
    .single()

  const access = await getAdminOfficeAccess({ ...profile, email: profile?.email || user.email })

  if (!access.canEnterAdmin) {
    redirect("/dashboard")
  }

  return (
    <div className="flat-dashboard flex min-h-screen bg-[#F4F7FA] text-slate-900 dark:bg-slate-950 dark:text-slate-100 print:bg-white print:block">
      <div className="flex-1 flex flex-col min-w-0 print:w-full print:block">
        <AdminTopBar />
        {children}
      </div>
    </div>
  )
}
