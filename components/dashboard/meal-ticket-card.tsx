import Link from "next/link";
import { Utensils, Ticket } from "lucide-react";


interface MealTicketCardProps {
  initialTicketCode?: string;
}

export function MealTicketCard({ initialTicketCode }: MealTicketCardProps) {
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
            {initialTicketCode 
              ? "Your meal ticket is ready. You can view your receipt and QR code below." 
              : "Your meal ticket has not been generated yet. Please visit the registration desk."}
          </p>
        </div>
      </div>

      <div className="mt-8 relative z-10 flex-1 flex flex-col justify-end">
        {initialTicketCode ? (
          <Link href="/dashboard/meal-ticket" className="block w-full">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-center text-white shadow-[0_8px_30px_rgba(79,70,229,0.2)] hover:scale-[1.02] transition-transform cursor-pointer">
              <div className="flex items-center justify-center gap-2 mb-2 opacity-80">
                <Ticket className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">View & Print Ticket</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black tracking-widest font-mono">
                {initialTicketCode}
              </div>
            </div>
          </Link>
        ) : (
          <div className="w-full bg-slate-50 border border-slate-200 border-dashed rounded-2xl py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Ticket className="w-8 h-8 opacity-20" />
            <span className="text-sm font-bold">Waiting for Admin...</span>
          </div>
        )}
      </div>
    </div>
  );
}

