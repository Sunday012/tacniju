import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { ReservationsTable } from "@/components/reservations-table"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function ReservationsPage() {
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

  // Get all members, sorting so that those without reservation numbers are at the top
  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, rank, assembly, reservation_number")
    .order('reservation_number', { ascending: true, nullsFirst: true })
    .order('full_name', { ascending: true })

  return (
    <div className="min-h-screen bg-[#F4F7FA] font-sans selection:bg-indigo-500/30 relative overflow-x-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-indigo-200/40 via-violet-100/20 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none -z-10 translate-x-1/3 -translate-y-1/4"></div>
      
      <header className="h-[88px] z-999 bg-white/70 flex items-center px-6 sm:px-10 w-full sticky top-0 py-4 backdrop-blur-2xl border-b border-indigo-100/50 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl text-slate-500 hover:text-indigo-700 hover:bg-indigo-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Button>
            </Link>
            <div>
              <h1 className="text-[17px] font-extrabold text-slate-800 leading-tight tracking-tight">Reservation Numbers</h1>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Admin Portal</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 z-10 relative print:py-0 print:px-0">
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
          
          <ReservationsTable members={members || []} />
        </div>
      </main>
    </div>
  )
}
