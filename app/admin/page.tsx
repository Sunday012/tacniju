import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { MembersTable } from "@/components/members-table"
import { AdminStats } from "@/components/admin-stats"
import { AdminCleanup } from "@/components/admin-cleanup"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AdminMobileNav } from "@/components/admin/mobile-nav"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/admin-login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()

  if (!profile?.is_admin) {
    redirect("/dashboard")
  }

  // Get all members
  const { data: members } = await supabase.from("profiles").select("*")

  // Get attendance stats
  const { data: attendanceStats } = await supabase
    .from("attendance")
    .select("event_name, event_date, attended")
    .order("event_date", { ascending: false })

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-[#F4F7FA] font-sans selection:bg-indigo-500/30 relative overflow-x-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-indigo-200/40 via-violet-100/20 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none -z-10 translate-x-1/3 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-100/40 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none -z-10 -translate-x-1/3 translate-y-1/3"></div>

      {/* Header */}
      <header className="h-[88px] z-999 bg-white/70 flex items-center justify-between px-6 sm:px-10 w-full sticky top-0 py-4 backdrop-blur-2xl border-b border-indigo-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-[1rem] hidden sm:flex items-center justify-center shadow-[0_8px_16px_rgba(79,70,229,0.25)] border border-indigo-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-[17px] font-extrabold text-slate-800 leading-tight tracking-tight">Admin Portal</h1>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Church Management</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Mobile hamburger — visible only on small screens */}
            <AdminMobileNav />

            {/* Desktop nav pill — hidden on mobile */}
            <div className="hidden sm:flex items-center gap-1.5 sm:gap-3 bg-white/80 p-1.5 rounded-2xl shadow-sm border border-slate-100">
            <Link href="/admin/scanner">
              <Button variant="ghost" size="sm" className="h-10 px-3 sm:px-4 rounded-xl text-slate-600 font-semibold hover:text-indigo-700 hover:bg-indigo-50 transition-colors">
                <svg className="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <span className="hidden sm:inline">Scanner</span>
              </Button>
            </Link>

            <Link href="/admin/events">
              <Button variant="ghost" size="sm" className="h-10 px-3 sm:px-4 rounded-xl text-slate-600 font-semibold hover:text-indigo-700 hover:bg-indigo-50 transition-colors">
                <svg className="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">Events</span>
              </Button>
            </Link>

            <Link href="/admin/reservations">
              <Button variant="ghost" size="sm" className="h-10 px-3 sm:px-4 rounded-xl text-slate-600 font-semibold hover:text-indigo-700 hover:bg-indigo-50 transition-colors">
                <svg className="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                <span className="hidden sm:inline">Reservations</span>
              </Button>
            </Link>

            <Link href="/admin/competitions">
              <Button variant="ghost" size="sm" className="h-10 px-3 sm:px-4 rounded-xl text-slate-600 font-semibold hover:text-indigo-700 hover:bg-indigo-50 transition-colors">
                <svg className="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span className="hidden sm:inline">Competitions</span>
              </Button>
            </Link>

            <Link href="/admin/stock">
              <Button variant="ghost" size="sm" className="h-10 px-3 sm:px-4 rounded-xl text-slate-600 font-semibold hover:text-indigo-700 hover:bg-indigo-50 transition-colors">
                <svg className="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="hidden sm:inline">Stock</span>
              </Button>
            </Link>

            <Link href="/accounting">
              <Button variant="ghost" size="sm" className="h-10 px-3 sm:px-4 rounded-xl text-slate-600 font-semibold hover:text-indigo-700 hover:bg-indigo-50 transition-colors">
                <svg className="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="hidden sm:inline">Accounting</span>
              </Button>
            </Link>

            <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

            <Link href="/dashboard" title="Switch to User Dashboard">
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Button>
            </Link>

            <form action={handleSignOut}>
              <Button variant="ghost" size="sm" type="submit" title="Sign Out" className="h-10 w-10 p-0 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </Button>
            </form>
            </div>{/* end desktop pill */}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 z-10 relative">
        <div className="space-y-10">
          {/* Stats Overview */}
          <div className="bg-white/70 backdrop-blur-3xl border border-white/60 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] transition-all">
            <h3 className="text-[20px] text-slate-800 font-extrabold tracking-tight flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[12px] shadow-sm border border-indigo-100/60">
                <svg className="w-[20px] h-[20px] text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              Platform Statistics
            </h3>
            <div className="admin-stats-wrapper">
              <AdminStats members={members || []} attendance={attendanceStats || []} />
            </div>
          </div>

          {/* Members Management */}
          <div className="bg-white/70 backdrop-blur-3xl border border-white/60 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] transition-all">
            <div className="mb-8 border-b border-slate-100/80 pb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h3 className="text-[22px] text-slate-800 font-extrabold tracking-tight flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-purple-50 to-violet-50 rounded-[14px] shadow-sm border border-purple-100/50">
                    <svg className="w-[22px] h-[22px] text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                   Youth Members Directory
                </h3>
                <p className="text-slate-500 text-[15px] mt-2.5 sm:ml-[52px] font-medium">Search, filter, edit roles and interact with all registered congregants.</p>
              </div>
            </div>
            <div className="members-table-wrapper rounded-2xl overflow-hidden shadow-inner border border-slate-200/50 bg-white">
              <MembersTable members={members || []} />
            </div>
          </div>
          
          {/* System Cleanup */}
          <div className="bg-white/70 backdrop-blur-3xl border border-white/60 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] transition-all">
            <h3 className="text-[20px] text-slate-800 font-extrabold tracking-tight flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-gradient-to-br from-rose-50 to-red-50 rounded-[12px] shadow-sm border border-rose-100/60">
                <svg className="w-[20px] h-[20px] text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              System Cleanup
            </h3>
            <div className="admin-cleanup-wrapper">
              <AdminCleanup />
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}