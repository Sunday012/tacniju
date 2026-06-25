"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Home, Calendar, Receipt, Settings, Users, MonitorPlay, Shield, Megaphone, Utensils, BookOpenText } from "lucide-react"
import { Scan, BookOpen } from "lucide-react"

export function SidebarNav({ profile }: { profile?: { is_admin?: boolean | null; department?: string | null } | null }) {
  const pathname = usePathname()
  const canScan = !!profile?.is_admin || profile?.department === "Ushering"
  const canAccount = !!profile?.is_admin || profile?.department === "Account Unit"

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Attendance", href: "/dashboard/attendance", icon: Calendar },
    { name: "Diary", href: "/dashboard/diary", icon: Users },
    { name: "Lounge", href: "/dashboard/lounge", icon: Shield },
    { name: "Announcements", href: "/dashboard/announcements", icon: Megaphone },
    { name: "Dreams", href: "/dashboard/dreams", icon: BookOpenText },
    { name: "Dining Hall", href: "/dashboard/dining-hall", icon: Utensils },
    ...(canScan ? [{ name: "Scanner", href: "/dashboard/scanner", icon: Scan }] : []),
    ...(canAccount ? [{ name: "Accounting", href: "/accounting", icon: BookOpen }] : []),
    { name: "Stall", href: "/dashboard/stall", icon: Receipt },
    { name: "Live Screen", href: "/present", icon: MonitorPlay },
  ]

  return (
    <aside className="w-64 bg-white/60 backdrop-blur-2xl border-r border-[#E5E7EB]/50 hidden lg:flex flex-col h-screen sticky top-0 py-8 px-5 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
      <div className="flex items-center gap-4 px-2 mb-12 cursor-pointer hover:opacity-90 transition-opacity">
        <div className="w-14 h-11 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 p-1.5 overflow-hidden">
          <Image 
            src="https://res.cloudinary.com/dzckvrvu9/image/upload/v1777993333/WhatsApp_Image_2026-05-01_at_08.37.56-removebg-preview_a8w3wt.png" 
            alt="TACN Logo" 
            width={80} 
            height={32} 
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">TACN IJU</h2>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Youth Portal</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs font-bold text-slate-400/80 uppercase tracking-widest mb-4 px-3">Overview</p>
        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link key={item.name} href={item.href}>
                <span className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? "bg-indigo-600/10 text-indigo-700 font-semibold" 
                    : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 font-medium"
                }`}>
                  <Icon className={`w-[22px] h-[22px] transition-colors ${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                  <span className="text-sm tracking-wide">{item.name}</span>
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
      
      <div className="mt-auto pt-6 border-t border-slate-200/50">
        <p className="text-xs font-bold text-slate-400/80 uppercase tracking-widest mb-4 px-3">Settings</p>
        <nav className="space-y-1.5">
          <Link href="/dashboard/settings">
            <span className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
              pathname === "/dashboard/settings" 
                ? "bg-indigo-600/10 text-indigo-700 font-semibold" 
                : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 font-medium"
            }`}>
              <Settings className={`w-[22px] h-[22px] transition-colors ${pathname === "/dashboard/settings" ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`} />
              <span className="text-sm tracking-wide">Settings</span>
            </span>
          </Link>
        </nav>
      </div>
    </aside>
  )
}
