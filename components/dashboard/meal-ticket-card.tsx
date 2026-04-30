"use client";

import { useState } from "react";
import { Utensils, Ticket, Loader2 } from "lucide-react";
import { generateMealTicket } from "@/app/actions/meal-tickets";
import { toast } from "sonner";

interface MealTicketCardProps {
  initialTicketCode?: string;
}

export function MealTicketCard({ initialTicketCode }: MealTicketCardProps) {
  const [ticketCode, setTicketCode] = useState(initialTicketCode);
  const [loading, setLoading] = useState(false);

  async function handleGenerateTicket() {
    setLoading(true);
    try {
      const res = await generateMealTicket();
      if (res.error) {
        toast.error(res.error);
      } else if (res.ticketCode) {
        setTicketCode(res.ticketCode);
        toast.success("Meal ticket generated successfully!");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-3xl border border-white/60 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] transition-all hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.14)] hover:border-indigo-100/80 h-full flex flex-col justify-between relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-indigo-100 to-violet-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="flex items-start gap-5 relative z-10">
        <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-[18px] shadow-sm border border-indigo-100/50 shrink-0">
          <Utensils className="w-7 h-7 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-[20px] text-slate-800 font-extrabold tracking-tight">Meal Ticket</h3>
          <p className="text-slate-500 text-[15px] mt-1.5 font-medium leading-relaxed">
            Generate your unique meal ticket for the event. This code can only be generated once.
          </p>
        </div>
      </div>

      <div className="mt-8 relative z-10 flex-1 flex flex-col justify-end">
        {ticketCode ? (
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-center text-white shadow-[0_8px_30px_rgba(79,70,229,0.2)]">
            <div className="flex items-center justify-center gap-2 mb-2 opacity-80">
              <Ticket className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Your Ticket Code</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black tracking-widest font-mono">
              {ticketCode}
            </div>
          </div>
        ) : (
          <button
            onClick={handleGenerateTicket}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-4 font-bold transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Ticket className="w-5 h-5" />
                <span>Generate My Ticket</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
