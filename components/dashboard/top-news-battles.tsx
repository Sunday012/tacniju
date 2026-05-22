"use client"
import { Swords, Trophy } from "lucide-react"

export function TopNewsBattles({ battles }: { battles: any[] }) {
  if (!battles || battles.length === 0) return null

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-800 rounded-[2rem] p-6 sm:p-8 shadow-xl text-white relative overflow-hidden mb-8">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Swords className="w-48 h-48" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
            <Trophy className="w-6 h-6 text-yellow-300" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-md">Top News: Live Battles</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {battles.map(b => (
            <div key={b.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 hover:bg-white/20 transition-colors group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-md text-white/90">
                  {b.category}
                </span>
                <span className="flex items-center gap-1 text-[10px] uppercase font-black tracking-widest text-emerald-300 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Live Match
                </span>
              </div>
              
              <h3 className="font-extrabold text-lg mb-4 text-white/90 truncate" title={b.title}>{b.title}</h3>
              
              <div className="flex items-center justify-between gap-3 bg-black/20 p-3 rounded-xl border border-white/10">
                <div className="flex-1 text-center truncate font-bold text-sm text-white/90">
                  {b.player1?.full_name?.split(' ')[0] || "Player 1"}
                </div>
                <div className="shrink-0 flex items-center justify-center bg-white/10 rounded-full w-6 h-6 border border-white/20">
                  <span className="text-[8px] font-black text-white/70">VS</span>
                </div>
                <div className="flex-1 text-center truncate font-bold text-sm text-white/90">
                  {b.player2?.full_name?.split(' ')[0] || "Player 2"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
