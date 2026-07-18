"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, Home, Calendar, Settings, LogOut, ShieldCheck, Users, Receipt, MonitorPlay, Shield, Megaphone, Utensils, BookOpenText, Music } from "lucide-react"
import { createClient } from "@/lib/client"
import { useRouter } from "next/navigation"

interface UserMobileNavProps {
  isAdmin?: boolean
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Attendance", href: "/dashboard/attendance", icon: Calendar },
  { label: "Diary", href: "/dashboard/diary", icon: Users },
  { label: "Lounge", href: "/dashboard/lounge", icon: Shield },
  { label: "Announcements", href: "/dashboard/announcements", icon: Megaphone },
  { label: "Dreams", href: "/dashboard/dreams", icon: BookOpenText },
  { label: "Lyrics", href: "/dashboard/lyrics", icon: Music },
  { label: "Dining Hall", href: "/dashboard/dining-hall", icon: Utensils },
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
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-10 w-10 rounded-xl text-slate-500 hover:bg-indigo-50 hover:text-indigo-700"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[270px] p-0 bg-white/95 backdrop-blur-2xl border-r border-slate-100">
        {/* Header */}
        <SheetHeader className="p-6 border-b border-slate-100">
          <SheetTitle className="text-left flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-md shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
              </svg>
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-base leading-tight">TACN IJU</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Youth Portal</p>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* Nav Items */}
        <nav className="flex flex-col p-4 gap-1 flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Overview</p>
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-indigo-600/10 text-indigo-700 border border-indigo-100"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}>
                  <Icon className={`w-[18px] h-[18px] ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  {label}
                </div>
              </Link>
            )
          })}

          {isAdmin && (
            <>
              <div className="my-3 border-t border-slate-100" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Admin</p>
              <Link href="/admin" onClick={() => setOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                  pathname.startsWith("/admin")
                    ? "bg-indigo-600/10 text-indigo-700 border border-indigo-100"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}>
                  <ShieldCheck className="w-[18px] h-[18px] text-slate-400" />
                  Admin Portal
                </div>
              </Link>
            </>
          )}
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
