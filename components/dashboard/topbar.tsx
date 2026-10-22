"use client"
import { Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/client"
import { UserMobileNav } from "@/components/dashboard/user-mobile-nav"
import { NotificationBell } from "@/components/notifications/notification-bell"

interface TopbarProps {
  userInitial: string
  avatarUrl?: string
  isAdmin: boolean
}

export function Topbar({ userInitial, avatarUrl, isAdmin }: TopbarProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    await fetch("/api/auth/signout", { method: "POST" })
    router.push("/select-church")
  }

  return (
    <header className="h-[88px] bg-white/80 flex items-center justify-between px-4 sm:px-10 w-full z-50 sticky top-0 py-4 backdrop-blur-xl border-b border-slate-200/40 dark:bg-slate-950 dark:border-slate-800/70">
      <div className="flex-1 flex items-center gap-3">
        {/* Mobile hamburger */}
        <UserMobileNav isAdmin={isAdmin} />

        <div className="relative w-full max-w-md hidden md:block group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search resources, events..." 
            className="w-full bg-white/80 border border-slate-200/80 rounded-lg pl-11 pr-4 py-3 text-[14px] text-slate-700 font-medium placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-[3px] focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-5 lg:gap-7">
        {isAdmin && (
          <Link href="/admin">
            <Button variant="outline" className="hidden sm:flex rounded-lg border-indigo-200/60 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100/50 shadow-sm font-semibold h-10 px-5 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300 dark:hover:bg-slate-800">
              Admin Portal
            </Button>
          </Link>
        )}
        
        <NotificationBell />

        <div className="h-8 w-[1px] bg-slate-200 hidden sm:block dark:bg-slate-800"></div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-slate-500 hover:text-slate-800 transition-colors duration-200 dark:text-slate-400 dark:hover:text-slate-100">
            <button type="button" onClick={handleSignOut} className="text-sm font-semibold px-2">
              Sign Out
            </button>
          </div>
          <Link href="/dashboard/settings">
            <div className="p-1 rounded-lg bg-white border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow cursor-pointer dark:bg-slate-900 dark:border-slate-800">
              <Avatar className="h-10 w-10 rounded-lg">
                {avatarUrl && <AvatarImage src={avatarUrl} />}
                <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-violet-50 text-indigo-700 font-bold rounded-lg text-sm dark:from-slate-800 dark:to-slate-900 dark:text-indigo-200">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
