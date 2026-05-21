"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { clearPresentationState } from "@/app/actions/presentation";
import { toast } from "sonner";
import { Loader2, MonitorOff } from "lucide-react";

export function ActiveScreenStatus() {
  const [isActive, setIsActive] = useState(false);
  const [clearing, setClearing] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchState = async () => {
      const { data } = await supabase.from("presentation_state").select("is_active").eq("id", 1).single();
      if (data) setIsActive(data.is_active);
    };
    fetchState();

    const channel = supabase.channel('status_updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'presentation_state', filter: 'id=eq.1' }, (payload) => {
        setIsActive(payload.new.is_active);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const handleClear = async () => {
    setClearing(true);
    try {
      const res = await clearPresentationState();
      if (res.error) toast.error(res.error);
      else toast.success("Screen cleared");
    } catch (e) {
      toast.error("Failed to clear screen");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
        <span className="text-sm font-bold text-slate-700">
          {isActive ? 'Screen Active' : 'Screen Idle'}
        </span>
      </div>
      
      <button 
        onClick={handleClear}
        disabled={!isActive || clearing}
        className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-50 border border-rose-200"
      >
        {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <MonitorOff className="w-4 h-4" />}
        Clear Screen
      </button>
    </div>
  );
}
