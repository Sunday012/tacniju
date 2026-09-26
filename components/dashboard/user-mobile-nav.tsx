"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, Home, Calendar, Settings, LogOut, ShieldCheck, Users, Receipt, MonitorPlay, Shield, Megaphone, Utensils, BookOpenText, Music, Landmark, ListOrdered } from "lucide-react"
import { createClient } from "@/lib/client"
import { useRouter } from "next/navigation"

interface UserMobileNavProps {
  isAdmin?: boolean
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Attendance", href: "/dashboard/attendance", icon: Calendar },
  { label: "Diary", href: "/dashboard/diary", icon: Users },
  { label: "Account", href: "/dashboard/account", icon: Landmark },
  { label: "Lounge", href: "/dashboard/lounge", icon: Shield },
  { label: "Announcements", href: "/dashboard/announcements", icon: Megaphone },
  { label: "Dreams", href: "/dashboard/dreams", icon: BookOpenText },
  { label: "Lyrics", href: "/dashboard/lyrics", icon: Music },
  { label: "Dining Hall", href: "/dashboard/dining-hall", icon: Utensils },
  { label: "Order of Service", href: "/dashboard/order-of-service", icon: ListOrdered },
  { label: "Stall", href: "/dashboard/stall", icon: Receipt },
  { label: "Live Screen", href: "/present", icon: MonitorPlay },
  { label: "Profile Settings", href: "/dashboard/settings", icon: Settings },
]

export function UserMobileNav({ isAdmin }: UserMobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    await fetch("/api/auth/signout", { method: "POST" })
    router.push("/select-church")
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-300" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="flex h-dvh w-[270px] flex-col p-0 bg-white/95 backdrop-blur-2xl border-r border-slate-100 dark:border-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {/* Header */}
        <SheetHeader className="shrink-0 p-6 border-b border-slate-100 dark:border-slate-800">
          <SheetTitle className="text-left flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow-md shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
              </svg>
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-base leading-tight dark:text-slate-100">TACN IJU</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-slate-500">Youth Portal</p>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* Nav Items */}
        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 custom-scrollbar">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 dark:text-slate-500">Overview</p>
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${isActive ? "bg-indigo-600/10 text-indigo-700 border border-indigo-100 dark:border-indigo-900 dark:bg-indigo-500/15 dark:text-indigo-300" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"}`}>
                  <Icon className={`w-[18px] h-[18px] ${isActive ? "text-indigo-600 dark:text-indigo-300" : "text-slate-400 dark:text-slate-500"}`} />
                  {label}
                </div>
              </Link>
            )
          })}

          {isAdmin && (
            <>
              <div className="my-3 border-t border-slate-100 dark:border-slate-800" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 dark:text-slate-500">Admin</p>
              <Link href="/admin" onClick={() => setOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${pathname.startsWith("/admin") ? "bg-indigo-600/10 text-indigo-700 border border-indigo-100 dark:border-indigo-900 dark:bg-indigo-500/15 dark:text-indigo-300" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"}`}>
                  <ShieldCheck className="w-[18px] h-[18px] text-slate-400 dark:text-slate-500" />
                  Admin Portal
                </div>
              </Link>
            </>
          )}
        </nav>

        {/* Sign out */}
        <div className="shrink-0 p-4 border-t border-slate-100 dark:border-slate-800">
          <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors dark:text-rose-300 dark:hover:bg-rose-950/30">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
