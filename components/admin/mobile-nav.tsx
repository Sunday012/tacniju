"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, Scan, Calendar, BookOpen, LayoutDashboard, LogOut, Shield, Users, Package, Trophy, Ticket, ChevronDown, MonitorPlay, Hash, ShoppingBag, Settings, Award, Swords, FileText, Megaphone, Utensils, BookMarked, BookOpenText, Building2, Mic2, Music } from "lucide-react"

type NavItem = {
  name: string
  href: string
  icon: any
  children?: NavItem[]
}

function itemMatchesPath(item: NavItem, pathname: string): boolean {
  if (pathname === item.href) return true
  if (item.href !== "/admin" && pathname.startsWith(item.href)) return true
  return item.children?.some(c => itemMatchesPath(c, pathname)) ?? false
}
import { createClient } from "@/lib/client"
import { useRouter } from "next/navigation"

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { name: "Admin Home", href: "/admin", icon: LayoutDashboard },
      { name: "Awards", href: "/admin/awards", icon: Award },
      { name: "System", href: "/admin/system", icon: Settings },
    ]
  },
  {
    title: "Operations",
    items: [
      { name: "Events", href: "/admin/events", icon: Calendar },
      { name: "Reservations", href: "/admin/reservations", icon: Hash },
      { name: "Meal Tickets", href: "/admin/meal-tickets", icon: Ticket },
      { name: "Dining Hall", href: "/admin/dining-hall", icon: Utensils },
      { name: "Families", href: "/admin/families", icon: Users },
      { name: "Departments", href: "/admin/departments", icon: Building2 },
    ]
  },
  {
    title: "Finance & Assets",
    items: [
      {
        name: "Gifts",
        href: "/admin/stock",
        icon: Package,
        children: [
          { name: "Gift Records", href: "/admin/stock/gift-records", icon: FileText },
        ],
      },
      { name: "Stall Orders", href: "/admin/stalls", icon: ShoppingBag },
      { name: "Accounting", href: "/accounting", icon: BookOpen },
      { name: "New Creation", href: "/admin/new-creation", icon: FileText },
    ]
  },
  {
    title: "Media & Tech",
    items: [
      { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
      { name: "Presentation Suite", href: "/admin/presenter", icon: MonitorPlay },
      { name: "Scanner", href: "/admin/scanner", icon: Scan },
    ]
  },
  {
    title: "Engagement",
    items: [
      { name: "Competitions", href: "/admin/competitions", icon: Trophy },
      { name: "Battles", href: "/admin/battles", icon: Swords },
    ]
  },
  {
    title: "Records",
    items: [
      {
        name: "Dreams",
        href: "/admin/records/dreams",
        icon: BookOpenText,
        children: [
          { name: "New", href: "/admin/records/dreams/new", icon: FileText },
          { name: "Category", href: "/admin/records/dreams/category", icon: BookMarked },
          { name: "Summary", href: "/admin/records/dreams/summary", icon: FileText },
        ],
      },
      {
        name: "Lyrics",
        href: "/admin/records/lyrics",
        icon: Music,
        children: [
          { name: "New", href: "/admin/records/lyrics/new", icon: FileText },
          { name: "Category", href: "/admin/records/lyrics/category", icon: BookMarked },
          { name: "Summary", href: "/admin/records/lyrics/summary", icon: FileText },
        ],
      },
      {
        name: "Teachings",
        href: "/admin/records/teachings",
        icon: BookMarked,
        children: [
          { name: "New", href: "/admin/records/teachings/new", icon: FileText },
          { name: "Category", href: "/admin/records/teachings/category", icon: BookMarked },
          { name: "Summary", href: "/admin/records/teachings/summary", icon: FileText },
        ],
      },
      {
        name: "Prophecies",
        href: "/admin/records/prophecies",
        icon: Mic2,
        children: [
          { name: "New", href: "/admin/records/prophecies/new", icon: FileText },
          { name: "Category", href: "/admin/records/prophecies/category", icon: BookMarked },
          { name: "Summary", href: "/admin/records/prophecies/summary", icon: FileText },
        ],
      },
      { name: "Points", href: "/admin/points", icon: Award },
    ]
  }
]

export function AdminMobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {}
    let foundActive = false

    NAV_GROUPS.forEach(group => {
      const hasActive = group.items.some(item => itemMatchesPath(item, pathname))
      initialState[group.title] = hasActive
      if (hasActive) foundActive = true
    })

    if (!foundActive) {
      initialState["Overview"] = true
    }
    return initialState
  })

  const [openItems, setOpenItems] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    NAV_GROUPS.forEach(group => {
      group.items.forEach(item => {
        if (item.children && item.children.some(c => itemMatchesPath(c, pathname))) {
          initial[item.href] = true
        }
      })
    })
    return initial
  })

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => {
      if (prev[title]) {
        return { ...prev, [title]: false }
      }

      const newState: Record<string, boolean> = {}
      Object.keys(prev).forEach(key => newState[key] = false)
      newState[title] = true
      return newState
    })
  }

  const toggleItem = (href: string) => {
    setOpenItems(prev => ({ ...prev, [href]: !prev[href] }))
  }

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
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <button 
                onClick={() => toggleGroup(group.title)}
                className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400/80 uppercase tracking-widest mb-2 px-2 hover:text-slate-600 transition-colors"
              >
                {group.title}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openGroups[group.title] ? 'rotate-180' : ''}`} />
              </button>
              
              <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${openGroups[group.title] ? 'max-h-[40rem] opacity-100' : 'max-h-0 opacity-0'}`}>
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                  const Icon = item.icon
                  const hasChildren = !!item.children?.length
                  const isOpen = !!openItems[item.href]

                  return (
                    <div key={item.href}>
                      <div
                        className={`flex items-center rounded-xl text-sm font-semibold transition-colors border ${
                          isActive
                            ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent"
                        }`}
                      >
                        <Link href={item.href} onClick={() => setOpen(false)} className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 px-3 py-2.5">
                            <Icon className={`w-4.5 h-4.5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                            <span className="truncate">{item.name}</span>
                          </div>
                        </Link>
                        {hasChildren && (
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); toggleItem(item.href) }}
                            className="p-2 mr-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                            aria-label={isOpen ? `Collapse ${item.name}` : `Expand ${item.name}`}
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                          </button>
                        )}
                      </div>

                      {hasChildren && (
                        <div className={`pl-7 mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                          {item.children!.map(child => {
                            const childActive = pathname === child.href || (child.href !== "/admin" && pathname.startsWith(child.href))
                            const ChildIcon = child.icon
                            return (
                              <Link key={child.href} href={child.href} onClick={() => setOpen(false)}>
                                <div className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold transition-colors border ${
                                  childActive
                                    ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent"
                                }`}>
                                  <ChildIcon className={`w-4 h-4 ${childActive ? "text-indigo-600" : "text-slate-400"}`} />
                                  <span className="truncate">{child.name}</span>
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
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
