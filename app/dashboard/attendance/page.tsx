import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { Calendar, CheckCircle2, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function AttendancePage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect("/auth/login")

  // Use service role to bypass RLS
  const adminSupabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: records } = await adminSupabase
    .from("member_attendance")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Attendance</h1>
        <p className="text-slate-500 mt-1 font-medium">Your event attendance history.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white/80 backdrop-blur border border-white/60 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Events Attended</p>
          <p className="text-4xl font-extrabold text-indigo-600">{records?.length ?? 0}</p>
        </div>
        <div className="bg-white/80 backdrop-blur border border-white/60 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Most Recent</p>
          <p className="text-xl font-bold text-slate-700 truncate">
            {records?.[0]?.event_name ?? "—"}
          </p>
          {records?.[0] && (
            <p className="text-sm text-slate-400 mt-1">
              {new Date(records[0].event_date).toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          )}
        </div>
      </div>

      {/* Attendance Records */}
      <div className="bg-white/80 backdrop-blur border border-white/60 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Event History</h2>
        </div>

        {!records || records.length === 0 ? (
          <div className="py-20 text-center">
            <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No attendance records yet.</p>
            <p className="text-slate-300 text-sm mt-1">Attend an event and get scanned to appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {records.map((record, i) => (
              <div key={record.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate">{record.event_name}</p>
                  <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(record.event_date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-semibold shrink-0">
                  Present
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
