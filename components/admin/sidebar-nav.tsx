"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Scan, 
  Calendar, 
  Hash, 
  Trophy, 
  Ticket, 
  Package, 
  BookOpen, 
  Home,
  LogOut
} from "lucide-react"

export function AdminSidebarNav() {
  const pathname = usePathname()

  const navItems = [
    { name: "Admin Home", href: "/admin", icon: LayoutDashboard },
    { name: "Scanner", href: "/admin/scanner", icon: Scan },
    { name: "Events", href: "/admin/events", icon: Calendar },
    { name: "Reservations", href: "/admin/reservations", icon: Hash },
    { name: "Competitions", href: "/admin/competitions", icon: Trophy },
    { name: "Meal Tickets", href: "/admin/meal-tickets", icon: Ticket },
    { name: "Stock", href: "/admin/stock", icon: Package },
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
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">Admin</h2>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Management</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs font-bold text-slate-400/80 uppercase tracking-widest mb-4 px-3">Management</p>
        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
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
      
      <div className="mt-auto pt-6 border-t border-slate-200/50 space-y-2">
        <p className="text-xs font-bold text-slate-400/80 uppercase tracking-widest mb-4 px-3">Quick Links</p>
        <Link href="/dashboard">
          <span className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 font-medium transition-all duration-300 group">
            <Home className="w-[22px] h-[22px] text-slate-400 group-hover:text-slate-600" />
            <span className="text-sm tracking-wide">User Dashboard</span>
          </span>
        </Link>
        <form action="/api/auth/signout" method="post">
          <button type="submit" className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 font-medium transition-all duration-300 group">
            <LogOut className="w-[22px] h-[22px] text-slate-400 group-hover:text-rose-500" />
            <span className="text-sm tracking-wide">Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
