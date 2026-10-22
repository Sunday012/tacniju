"use client"

import Image from "next/image"
import Link from "next/link"
import { Home, LogOut, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { NotificationBell } from "@/components/notifications/notification-bell"

export function AdminTopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl sm:px-8 print:hidden dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4">
        <Link href="/admin" className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <Image
              src="https://res.cloudinary.com/dzckvrvu9/image/upload/v1777993333/WhatsApp_Image_2026-05-01_at_08.37.56-removebg-preview_a8w3wt.png"
              alt="TACN logo"
              width={36}
              height={36}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold text-slate-900 dark:text-slate-100">Admin Portal</p>
            <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Divine | Accounts | Technology</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/admin" className="hidden sm:block">
            <Button variant="outline" className="h-9 gap-2 border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
              <Home className="h-4 w-4" />
              Main Menu
            </Button>
          </Link>

          <NotificationBell />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9 gap-2 border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" aria-label="Open account menu">
                <UserRound className="h-4 w-4" />
                <span className="hidden sm:inline">Account</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900">
              <Link href="/dashboard" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Home className="h-4 w-4 text-slate-500" />
                User Dashboard
              </Link>
              <form action="/api/auth/signout" method="post">
                <button type="submit" className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </form>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  )
}
