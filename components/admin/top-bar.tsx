"use client"
import Image from "next/image"
import { AdminMobileNav } from "./mobile-nav"

export function AdminTopBar() {
  return (
    <header className="h-[88px] z-30 bg-white/70 flex items-center justify-between px-6 sm:px-10 w-full sticky top-0 py-4 backdrop-blur-2xl border-b border-indigo-100/50 shadow-sm lg:hidden print:hidden dark:border-slate-800 dark:bg-slate-950/80">
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200 p-2 overflow-hidden dark:border-slate-700 dark:bg-slate-900">
            <Image 
              src="https://res.cloudinary.com/dzckvrvu9/image/upload/v1777993333/WhatsApp_Image_2026-05-01_at_08.37.56-removebg-preview_a8w3wt.png" 
              alt="TACN Logo" 
              width={100} 
              height={40} 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-[17px] font-extrabold text-slate-800 leading-tight tracking-tight dark:text-slate-100">Admin Portal</h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 dark:text-slate-400">Church Management</p>
          </div>
        </div>

        <div className="flex items-center">
          <AdminMobileNav />
        </div>
      </div>
    </header>
  )
}
