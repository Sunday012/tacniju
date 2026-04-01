import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import Link from "next/link"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { Topbar } from "@/components/dashboard/topbar"
import { WelcomeBanner } from "@/components/dashboard/welcome-banner"
import { QuickStats } from "@/components/dashboard/quick-stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { IdCardQr } from "@/components/dashboard/id-card-qr"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  // Get recent attendance
  const { data: attendance } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", user.id)
    .order("event_date", { ascending: false })
    .limit(5)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const initials = getInitials(profile?.full_name || "User")

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col lg:flex-row font-sans selection:bg-indigo-500/30">
      {/* Sidebar Navigation */}
      <SidebarNav />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative">
        {/* Subtle background blur effects (Crextio style) */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-indigo-200/40 via-violet-100/20 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none -z-10 translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-100/40 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none -z-10 -translate-x-1/3 translate-y-1/3"></div>

        {/* Top Header */}
        <Topbar 
          userInitial={initials}
          avatarUrl={profile?.avatar_url || undefined}
          isAdmin={!!profile?.is_admin}
        />

        {/* Main Dashboard Grid */}
        <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-[1600px] mx-auto w-full z-10">
          <WelcomeBanner 
            fullName={profile?.full_name || "Member"}
            rank={profile?.rank}
            department={profile?.department}
            avatarUrl={profile?.avatar_url || undefined}
            initials={initials}
          />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Row 1 Left: Digital Pass */}
            <IdCardQr userId={profile?.id || user.id} />

            {/* Row 1 Right: Profile Settings */}
            <Link href="/dashboard/settings">
              <div className="bg-white/80 backdrop-blur-3xl border border-white/60 rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] transition-all hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.14)] hover:border-indigo-100/80 cursor-pointer group h-full">
                <div className="flex items-start gap-5">
                  <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-[18px] shadow-sm border border-indigo-100/50 group-hover:from-indigo-100 group-hover:to-violet-100 transition-all shrink-0">
                    <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[20px] text-slate-800 font-extrabold tracking-tight group-hover:text-indigo-700 transition-colors">Profile Settings</h3>
                    <p className="text-slate-500 text-[15px] mt-1.5 font-medium leading-relaxed">Update your personal information, upload a profile photo, and manage your account details.</p>
                    <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-indigo-600 group-hover:gap-3 transition-all">
                      Edit Profile
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Row 2 Left: Upcoming Events */}
            <UpcomingEvents />

            {/* Row 2 Right: Quick Stats */}
            <QuickStats 
              rank={profile?.rank || "C-Multitude"}
              department={profile?.department || ""}
              assembly={profile?.assembly || ""}
              eventsCount={attendance?.length || 0}
            />

            {/* Row 3: Recent Activity — full width */}
            <div className="xl:col-span-2">
              <RecentActivity attendance={attendance || []} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
