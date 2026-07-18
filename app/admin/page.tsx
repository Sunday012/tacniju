import { createClient } from "@/lib/server"
import { MembersTable } from "@/components/members-table"
import { AdminStats } from "@/components/admin-stats"
import { getAllAssetAssignments } from "@/app/actions/assets"
import { isGuestProfile } from "@/lib/profile-kind"

export default async function AdminPage() {
  const supabase = await createClient()

  // Get all members
  const { data: members } = await supabase.from("profiles").select("*")
  const memberProfiles = (members || []).filter(member => !isGuestProfile(member) && member.member_status !== "Transferred")
  const guestProfiles = (members || []).filter(member => isGuestProfile(member))

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

  // Get gifts
  const { assignments: gifts } = await getAllAssetAssignments();

  return (
    <div className="p-6 md:p-10 relative">
      <main className="max-w-7xl mx-auto z-10 relative">
        <div className="space-y-10">
          {/* Stats Overview */}
          <div className="bg-white/70 backdrop-blur-3xl border border-white/60 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none">
            <h3 className="text-[20px] text-slate-800 font-extrabold tracking-tight flex items-center gap-3 mb-6 dark:text-slate-100">
              <div className="p-2.5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[12px] shadow-sm border border-indigo-100/60 dark:border-indigo-900/60 dark:from-indigo-950 dark:to-slate-900">
                <svg className="w-[20px] h-[20px] text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              Platform Statistics
            </h3>
            <div className="admin-stats-wrapper">
              <AdminStats members={memberProfiles} attendance={attendanceStats || []} />
            </div>
          </div>

          {/* Members Management */}
          <div className="bg-white/70 backdrop-blur-3xl border border-white/60 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none">
            <div className="mb-8 border-b border-slate-100/80 pb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between dark:border-slate-800">
              <div>
                <h3 className="text-[22px] text-slate-800 font-extrabold tracking-tight flex items-center gap-3 dark:text-slate-100">
                  <div className="p-2.5 bg-gradient-to-br from-purple-50 to-violet-50 rounded-[14px] shadow-sm border border-purple-100/50 dark:border-purple-900/60 dark:from-purple-950 dark:to-slate-900">
                    <svg className="w-[22px] h-[22px] text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                   Youth Members Directory
                </h3>
                <p className="text-slate-500 text-[15px] mt-2.5 sm:ml-[52px] font-medium dark:text-slate-400">Search, filter, edit roles and interact with registered youth members.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <a href="/admin/diary" className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-semibold border border-indigo-100 hover:bg-indigo-100 transition-colors text-center dark:border-indigo-900/60 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-950">
                  View Full Diary
                </a>
                <a href="/admin/guests" className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl font-semibold border border-amber-100 hover:bg-amber-100 transition-colors text-center dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950">
                  View Guests ({guestProfiles.length})
                </a>
              </div>
            </div>
            <div className="members-table-wrapper rounded-2xl overflow-hidden shadow-inner border border-slate-200/50 bg-white dark:border-slate-800 dark:bg-slate-950">
              <MembersTable members={memberProfiles} availableAwards={awards || []} gifts={gifts || []} />
            </div>
          </div>
          

        </div>
      </main>
    </div>
  )
}
