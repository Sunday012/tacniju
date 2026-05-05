"use client";

import { useState } from "react";
import { Users, Loader2, Sparkles, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { generateTeams } from "@/app/actions/competitions";
import { toast } from "sonner";

export function TeamBuilder({ competitionId, entryCount }: { competitionId: string, entryCount: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teamCount, setTeamCount] = useState(2);

  async function handleGenerate() {
    if (entryCount === 0) {
      toast.error("No entries to distribute.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await generateTeams(competitionId, teamCount);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Successfully distributed into ${teamCount} teams!`);
        setOpen(false);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-[0_4px_16px_rgba(99,102,241,0.3)]">
          <Sparkles className="h-5 w-5" />
          <span>Team Building</span>
        </button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[400px] bg-white border-slate-200 text-slate-800 p-0 shadow-2xl rounded-2xl">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl flex items-center gap-2 font-extrabold text-slate-800">
              <Users className="h-5 w-5 text-violet-500" />
              Random Team Distributor
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-1">
              Distribute all {entryCount} participants into random groups.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">Number of Teams</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="2"
                  max={Math.max(20, entryCount)}
                  value={teamCount}
                  onChange={(e) => setTeamCount(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <input 
                  type="number"
                  min="2"
                  max={Math.max(20, entryCount)}
                  value={teamCount}
                  onChange={(e) => setTeamCount(Math.min(Math.max(20, entryCount), Math.max(2, parseInt(e.target.value) || 2)))}
                  className="bg-indigo-50 text-indigo-700 font-black w-16 py-1 rounded-lg border border-indigo-100 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                ~{Math.floor(entryCount / teamCount)} members per team
              </p>
            </div>

            {entryCount < teamCount && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 text-amber-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>You have fewer participants than teams. Some teams will be empty.</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || entryCount === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Teams Now
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
