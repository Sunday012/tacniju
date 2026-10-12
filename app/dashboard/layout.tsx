import { redirect } from "next/navigation"
import { getAdminOfficeAccess } from "@/lib/access"
import { createClient } from "@/lib/server"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { Topbar } from "@/components/dashboard/topbar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  const initials = getInitials(profile?.full_name || "User")
  const adminAccess = await getAdminOfficeAccess({ ...profile, email: profile?.email || user.email })

  return (
    <div className="flat-dashboard min-h-screen bg-[#F4F7FA] flex flex-col lg:flex-row font-sans selection:bg-indigo-500/30 dark:bg-slate-950">
      {/* Sidebar Navigation */}
      <SidebarNav profile={profile || null} canEnterAdmin={adminAccess.canEnterAdmin} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative">

        {/* Top Header */}
        <Topbar
          userInitial={initials}
          avatarUrl={profile?.avatar_url || undefined}
          isAdmin={adminAccess.canEnterAdmin}
        />

        {/* Page Content */}
        <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-[1600px] mx-auto w-full z-10">
          {children}
        </main>
      </div>
    </div>
  )
}
