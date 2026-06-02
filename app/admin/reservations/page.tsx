import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { ReservationsTable } from "@/components/reservations-table"
import { isGuestProfile } from "@/lib/profile-kind"

export default async function ReservationsPage() {
  const supabase = await createClient()
  // Get all members, sorting so that those without reservation numbers are at the top
  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, rank, assembly, district, email, reservation_number")
    .order('reservation_number', { ascending: true, nullsFirst: true })
    .order('full_name', { ascending: true })
  const memberProfiles = (members || []).filter(member => !isGuestProfile(member))

  return (
    <div className="p-6 md:p-10 relative">
      <main className="max-w-7xl mx-auto z-10 relative print:py-0 print:px-0">
        <div className="bg-white/70 backdrop-blur-3xl border border-white/60 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] transition-all print:shadow-none print:border-none print:bg-white print:p-0">
          <div className="mb-8 border-b border-slate-100/80 pb-6">
            <h3 className="text-[22px] text-slate-800 font-extrabold tracking-tight flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[14px] shadow-sm border border-indigo-100/50">
                <svg className="w-[22px] h-[22px] text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
               Manage Reservations
            </h3>
            <p className="text-slate-500 text-[15px] mt-2.5 sm:ml-[52px] font-medium">Generate and view reservation numbers for congregants.</p>
          </div>
          
          <ReservationsTable members={memberProfiles} />
        </div>
      </main>
    </div>
  )
}
