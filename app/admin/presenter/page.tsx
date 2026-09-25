import { Monitor, BookOpen, Music, Type } from "lucide-react";
import { CustomTextController } from "@/components/presenter/CustomTextController";
import { BibleController } from "@/components/presenter/BibleController";
import { SongsController } from "@/components/presenter/SongsController";
import { ActiveScreenStatus } from "@/components/presenter/ActiveScreenStatus";
import { TimerController } from "@/components/presenter/TimerController";

export const dynamic = "force-dynamic";

export default function PresenterDashboard() {
  return (
    <div className="p-6 md:p-10 relative">
      <div className="relative z-10 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Monitor className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Presenter Controller</h1>
              <p className="text-slate-500 mt-1 font-medium">Manage what is currently displayed on the projector screen.</p>
            </div>
          </div>
          
          <ActiveScreenStatus />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <BibleController />
            <SongsController />
          </div>
          <div className="space-y-8">
            <TimerController />
            <CustomTextController />
            
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl">
              <h3 className="font-bold text-slate-800 mb-2">Display Settings</h3>
              <p className="text-sm text-slate-500 mb-4">Open the display screen on a secondary monitor or projector and maximize it.</p>
              <a 
                href="/present" 
                target="_blank" 
                className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-3 rounded-xl font-bold transition-all shadow-sm"
              >
                <Monitor className="w-4 h-4" />
                Launch Display Screen
              </a>
              <a
                href="/present/order-of-service"
                target="_blank"
                className="mt-3 w-full flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-3 rounded-xl font-bold transition-all shadow-sm"
              >
                <BookOpen className="w-4 h-4" />
                Order of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
