import { redirect } from "next/navigation"
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

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col lg:flex-row font-sans selection:bg-indigo-500/30">
      {/* Sidebar Navigation */}
      <SidebarNav profile={profile || null} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative">
        {/* Subtle background blur effects */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-indigo-200/40 via-violet-100/20 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none -z-10 translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-100/40 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none -z-10 -translate-x-1/3 translate-y-1/3"></div>

        {/* Top Header */}
        <Topbar
          userInitial={initials}
          avatarUrl={profile?.avatar_url || undefined}
          isAdmin={!!profile?.is_admin}
        />

        {/* Page Content */}
        <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-[1600px] mx-auto w-full z-10">
          {children}
        </main>
      </div>
    </div>
  )
}
