import { createClient } from "@/lib/server"
import { MembersTable } from "@/components/members-table"
import { AdminStats } from "@/components/admin-stats"
import { AdminCleanup } from "@/components/admin-cleanup"
import { AdminAwards } from "@/components/admin-awards"

export default async function AdminPage() {
  const supabase = await createClient()

  // Get all members
  const { data: members } = await supabase.from("profiles").select("*")

  // Get attendance stats
  const { data: attendanceStats } = await supabase
    .from("attendance")
    .select("event_name, event_date, attended")
    .order("event_date", { ascending: false })

  // Get awards
  const { data: awards } = await supabase
    .from("awards")
    .select("*")
    .order("created_at", { ascending: true })

  return (
    <div className="p-6 md:p-10 relative">
      <main className="max-w-7xl mx-auto z-10 relative">
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
              <a href="/admin/diary" className="shrink-0 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-semibold border border-indigo-100 hover:bg-indigo-100 transition-colors">
                View Full Diary
              </a>
            </div>
            <div className="members-table-wrapper rounded-2xl overflow-hidden shadow-inner border border-slate-200/50 bg-white">
              <MembersTable members={members || []} availableAwards={awards || []} />
            </div>
          </div>
          
          {/* Awards Management */}
          <div className="admin-awards-wrapper">
             <AdminAwards awards={awards || []} />
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