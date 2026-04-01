"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, Receipt, Settings, Users } from "lucide-react"

export function SidebarNav() {
  const pathname = usePathname()

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Attendance", href: "/dashboard/attendance", icon: Calendar },
    // { name: "Vouchers", href: "/dashboard/vouchers", icon: Receipt },
    // { name: "Members", href: "/dashboard/members", icon: Users },
  ]

  return (
    <aside className="w-64 bg-white/60 backdrop-blur-2xl border-r border-[#E5E7EB]/50 hidden lg:flex flex-col h-screen sticky top-0 py-8 px-5 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
      <div className="flex items-center gap-4 px-2 mb-12 cursor-pointer hover:opacity-90 transition-opacity">
        <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-[0_8px_16px_rgba(79,70,229,0.25)] border border-indigo-500/20">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
          </svg>
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
            const isActive = pathname === item.href
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
