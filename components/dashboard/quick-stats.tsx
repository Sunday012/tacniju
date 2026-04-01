import { Badge } from "@/components/ui/badge"

interface QuickStatsProps {
  rank: string
  department: string
  assembly: string
  eventsCount: number
}

export function QuickStats({ rank, department, assembly, eventsCount }: QuickStatsProps) {
  return (
    <div className="bg-white/70 backdrop-blur-3xl border border-white/60 rounded-[2rem] p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] transition-shadow">
      <h3 className="text-lg text-slate-800 font-extrabold mb-6 tracking-tight flex items-center gap-2.5">
        <span className="w-1.5 h-5 bg-indigo-500 rounded-full inline-block shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
        Quick Stats
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center p-3.5 rounded-[1.25rem] bg-gradient-to-br from-slate-50 to-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <span className="text-[13px] font-bold text-slate-500 ml-2 uppercase tracking-wide">Current Rank</span>
          <Badge
            variant="secondary"
            className={`rounded-xl px-4 py-1.5 text-xs font-bold shadow-sm ${
              rank === "A-Chosen"
                ? "bg-amber-100/80 text-amber-800 border border-amber-200"
                : rank === "B-Called"
                  ? "bg-indigo-100/80 text-indigo-800 border border-indigo-200"
                  : "bg-slate-100/80 text-slate-700 border border-slate-200"
            }`}
          >
            {rank || "C-Multitude"}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center p-3.5 rounded-[1.25rem] bg-gradient-to-br from-slate-50 to-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <span className="text-[13px] font-bold text-slate-500 ml-2 uppercase tracking-wide">Department</span>
          <span className="text-sm font-bold text-slate-800 bg-white shadow-sm border border-slate-100 px-4 py-1.5 rounded-xl">
            {department || "Not assigned"}
          </span>
        </div>
        
        <div className="flex justify-between items-center p-3.5 rounded-[1.25rem] bg-gradient-to-br from-slate-50 to-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <span className="text-[13px] font-bold text-slate-500 ml-2 uppercase tracking-wide">Assembly</span>
          <span className="text-sm font-bold text-slate-800 bg-white shadow-sm border border-slate-100 px-4 py-1.5 rounded-xl">
            {assembly || "Not specified"}
          </span>
        </div>
        
        <div className="flex justify-between items-center p-3.5 rounded-[1.25rem] bg-gradient-to-br from-slate-50 to-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <span className="text-[13px] font-bold text-slate-500 ml-2 uppercase tracking-wide">Events</span>
          <span className="text-sm font-bold text-slate-800 bg-white shadow-sm border border-slate-100 px-4 py-1.5 rounded-xl min-w-[2.5rem] text-center">
            {eventsCount}
          </span>
        </div>
      </div>
    </div>
  )
}
