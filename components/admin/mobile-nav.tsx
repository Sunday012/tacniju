"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, ScanLine, CalendarDays, BookOpen, LayoutDashboard, LogOut, Shield, Users, Package, Trophy, Ticket } from "lucide-react"
import { createClient } from "@/lib/client"
import { useRouter } from "next/navigation"

const navItems = [
  { label: "Admin Home", href: "/admin", icon: Shield },
  { label: "Scanner", href: "/admin/scanner", icon: ScanLine },
  { label: "Events", href: "/admin/events", icon: CalendarDays },
  { label: "Reservations", href: "/admin/reservations", icon: Users },
  { label: "Competitions", href: "/admin/competitions", icon: Trophy },
  { label: "Meal Tickets", href: "/admin/meal-tickets", icon: Ticket },
  { label: "Program Stock", href: "/admin/stock", icon: Package },
  { label: "User Dashboard", href: "/dashboard", icon: LayoutDashboard },
]

export function AdminMobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

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

      <SheetContent side="left" className="w-[280px] p-0 bg-white border-r border-slate-100 z-9999">
        <SheetHeader className="p-6 border-b border-slate-100 bg-gradient-to-br from-indigo-600 to-violet-700">
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

        <nav className="flex flex-col p-4 gap-1 flex-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href))
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  {label}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
