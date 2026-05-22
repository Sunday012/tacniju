"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, ScanLine, CalendarDays, BookOpen, LayoutDashboard, LogOut, Shield, Users, Package, Trophy, Ticket, ChevronDown, MonitorPlay } from "lucide-react"
import { createClient } from "@/lib/client"
import { useRouter } from "next/navigation"

export function AdminMobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Overview": true,
    "Operations": true,
    "Finance & Assets": true,
    "Media & Tech": true,
    "Engagement": true
  })

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }))
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const navGroups = [
    {
      title: "Overview",
      items: [
        { name: "Admin Home", href: "/admin", icon: LayoutDashboard },
      ]
    },
    {
      title: "Operations",
      items: [
        { name: "Events", href: "/admin/events", icon: CalendarDays },
        { name: "Reservations", href: "/admin/reservations", icon: Users },
        { name: "Meal Tickets", href: "/admin/meal-tickets", icon: Ticket },
      ]
    },
    {
      title: "Finance & Assets",
      items: [
        { name: "Stock & Gifts", href: "/admin/stock", icon: Package },
        { name: "Accounting", href: "/admin/accounting", icon: BookOpen },
      ]
    },
    {
      title: "Media & Tech",
      items: [
        { name: "Presentation Suite", href: "/admin/presenter", icon: MonitorPlay },
        { name: "Scanner", href: "/admin/scanner", icon: ScanLine },
      ]
    },
    {
      title: "Engagement",
      items: [
        { name: "Competitions", href: "/admin/competitions", icon: Trophy },
      ]
    }
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden h-10 w-10 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[280px] p-0 bg-white border-r border-slate-100 z-[9999] flex flex-col h-full">
        <SheetHeader className="p-6 border-b border-slate-100 bg-gradient-to-br from-indigo-600 to-violet-700 shrink-0">
          <SheetTitle className="text-white text-left flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-extrabold text-base leading-tight">Admin Portal</p>
              <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">Church Management</p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              <button 
                onClick={() => toggleGroup(group.title)}
                className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400/80 uppercase tracking-widest mb-2 px-2 hover:text-slate-600 transition-colors"
              >
                {group.title}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openGroups[group.title] ? 'rotate-180' : ''}`} />
              </button>
              
              <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${openGroups[group.title] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                  const Icon = item.icon
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                      <div
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                          isActive
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                        }`}
                      >
                        <Icon className={`w-4.5 h-4.5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                        {item.name}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400/80 uppercase tracking-widest mb-2 px-2">Quick Links</p>
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors border border-transparent">
                <LayoutDashboard className="w-4.5 h-4.5 text-slate-400" />
                User Dashboard
              </div>
            </Link>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 shrink-0">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4.5 h-4.5" />
            Sign Out
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
