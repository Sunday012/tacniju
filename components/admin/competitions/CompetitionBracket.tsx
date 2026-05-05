"use client";

import { Trophy, Users, User, ArrowRight } from "lucide-react";

export function CompetitionBracket({ teams }: { teams: any[] }) {
  if (!teams || teams.length === 0) {
    return (
      <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white/40">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-700">No Teams Formed Yet</h3>
        <p className="text-slate-500 mt-2 max-w-xs mx-auto">
          Use the Team Building tool to distribute participants into groups.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {teams.map((team, index) => (
        <div 
          key={team.id} 
          className="group bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_-12px_rgba(79,70,229,0.15)] transition-all relative overflow-hidden"
        >
          {/* Decorative background number */}
          <div className="absolute -top-4 -right-4 text-[120px] font-black text-indigo-500/5 select-none pointer-events-none group-hover:text-indigo-500/10 transition-colors">
            {index + 1}
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-200">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{team.team_name}</h3>
                <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest mt-0.5">
                  {team.members?.length || 0} Participants
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {team.members?.map((entry: any) => (
                <div 
                  key={entry.id} 
                  className="flex items-center justify-between p-4 bg-white/50 border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-white transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{entry.profile?.full_name}</p>
                      <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">
                        {entry.profile?.reservation_number || "No Res. No."}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-indigo-400 transition-colors" />
                </div>
              ))}
              
              {(!team.members || team.members.length === 0) && (
                <p className="text-center py-6 text-slate-400 text-sm italic">Empty Team</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
