import { AttendanceHistory } from "@/components/attendance-history"
import Link from "next/link"

interface RecentActivityProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attendance: any[]
}

export function RecentActivity({ attendance }: RecentActivityProps) {
  return (
    <div className="bg-white/70 backdrop-blur-3xl border border-white/60 rounded-[2rem] p-8 mt-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg text-slate-800 font-extrabold tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-violet-500 rounded-full inline-block shadow-[0_0_10px_rgba(139,92,246,0.5)]"></span>
          Recent Attendance
        </h3>
        <Link href="/dashboard/attendance">
          <button className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-2.5 px-4 rounded-xl transition-colors shadow-sm">
            View All
          </button>
        </Link>
      </div>
      
      <div className="bg-slate-50/80 rounded-[1.5rem] p-5 border border-slate-100 shadow-inner">
        <AttendanceHistory attendance={attendance} />
      </div>
    </div>
  )
}
