"use client"
import { useState } from "react"
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
  LogOut,
  ChevronDown,
  MonitorPlay,
  Users,
  Swords,
  ShoppingBag,
  Settings,
  Award,
  FileText,
  Megaphone,
  Utensils,
  BookMarked,
  BookOpenText,
  Building2,
  Mic2,
  MicVocal,
  Music,
  MapPin,
  Cake
} from "lucide-react"

type NavItem = {
  name: string
  href: string
  icon: any
  children?: NavItem[]
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Admin Office",
    items: [
      { name: "Main Menu", href: "/admin", icon: LayoutDashboard },
      { name: "Awards", href: "/admin/awards", icon: Award },
      { name: "System", href: "/admin/system", icon: Settings },
    ]
  },
  {
    title: "Secretariat",
    items: [
      { name: "Events", href: "/admin/events", icon: Calendar },
      { name: "Reservations", href: "/admin/reservations", icon: Hash },
      { name: "Meal Tickets", href: "/admin/meal-tickets", icon: Ticket },
      { name: "Dining Hall", href: "/admin/dining-hall", icon: Utensils },
      {
        name: "Diary",
        href: "/admin/diary",
        icon: BookOpen,
        children: [
          { name: "Locations", href: "/admin/diary/locations", icon: MapPin },
          { name: "Birthdays", href: "/admin/diary/birthdays", icon: Cake },
        ],
      },
      { name: "Families", href: "/admin/families", icon: Users },
      { name: "Departments", href: "/admin/departments", icon: Building2 },
    ]
  },
  {
    title: "Financial Secretary",
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
      { name: "Programs", href: "/accounting/programs", icon: Calendar },
      { name: "New Creation", href: "/admin/new-creation", icon: FileText },
    ]
  },
  {
    title: "Technology & Media",
    items: [
      { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
      { name: "Presentation Suite", href: "/admin/presenter", icon: MonitorPlay },
      { name: "Scanner", href: "/admin/scanner", icon: Scan },
    ]
  },
  {
    title: "Assistants",
    items: [
      { name: "Competitions", href: "/admin/competitions", icon: Trophy },
      { name: "Battles", href: "/admin/battles", icon: Swords },
    ]
  },
  {
    title: "Assistant Records",
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
        name: "Memos",
        href: "/admin/records/memos",
        icon: FileText,
        children: [
          { name: "New", href: "/admin/records/memos/new", icon: FileText },
          { name: "Category", href: "/admin/records/memos/category", icon: BookMarked },
          { name: "Summary", href: "/admin/records/memos/summary", icon: FileText },
        ],
      },
      {
        name: "Teachings",
        href: "/admin/records/teachings",
        icon: BookMarked,
        children: [
          { name: "New", href: "/admin/records/teachings/new", icon: FileText },
          { name: "Transcribe", href: "/admin/records/teachings/transcribe", icon: MicVocal },
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

function itemMatchesPath(item: NavItem, pathname: string): boolean {
  if (pathname === item.href) return true
  if (item.href !== "/admin" && pathname.startsWith(item.href)) return true
  return item.children?.some(c => itemMatchesPath(c, pathname)) ?? false
}

export function AdminSidebarNav() {
  const pathname = usePathname()

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {}
    let foundActive = false

    NAV_GROUPS.forEach(group => {
      const hasActive = group.items.some(item => itemMatchesPath(item, pathname))
      initialState[group.title] = hasActive
      if (hasActive) foundActive = true
    })

    if (!foundActive) {
      initialState["Admin Office"] = true
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

  return (
    <aside className="w-64 bg-white/60 backdrop-blur-2xl border-r border-[#E5E7EB]/50 hidden lg:flex flex-col h-screen sticky top-0 py-8 px-5 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 print:hidden overflow-y-auto custom-scrollbar dark:border-slate-900 dark:bg-slate-950 dark:text-slate-100 dark:shadow-none">
      <div className="flex items-center gap-4 px-2 mb-10 cursor-pointer hover:opacity-90 transition-opacity">
        <div className="w-14 h-11 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200 p-1.5 overflow-hidden shrink-0 dark:border-slate-800 dark:bg-slate-900">
          <Image 
            src="https://res.cloudinary.com/dzckvrvu9/image/upload/v1777993333/WhatsApp_Image_2026-05-01_at_08.37.56-removebg-preview_a8w3wt.png" 
            alt="TACN Logo" 
            width={80} 
            height={32} 
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight dark:text-slate-100">Admin</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 dark:text-slate-400">Divine | Accounts | Tech</p>
        </div>
      </div>

      <div className="space-y-6 flex-1 pb-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <button 
              onClick={() => toggleGroup(group.title)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-400/80 uppercase tracking-widest mb-2 px-3 hover:text-slate-600 transition-colors dark:text-slate-500 dark:hover:text-slate-300"
            >
              {group.title}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openGroups[group.title] ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${openGroups[group.title] ? 'max-h-[40rem] opacity-100' : 'max-h-0 opacity-0'}`}>
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                const Icon = item.icon
                const hasChildren = !!item.children?.length
                const isOpen = !!openItems[item.href]

                return (
                  <div key={item.name}>
                    <div className={`flex items-center rounded-lg transition-all duration-200 group ${
                      isActive
                        ? "bg-indigo-600/10 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                        : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                    }`}>
                      <Link href={item.href} className="flex-1 min-w-0">
                        <span className="flex items-center gap-3.5 px-4 py-2.5">
                          <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-indigo-600 dark:text-indigo-300" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"}`} />
                          <span className={`text-sm tracking-wide truncate ${isActive ? "font-semibold" : "font-medium"}`}>{item.name}</span>
                        </span>
                      </Link>
                      {hasChildren && (
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); toggleItem(item.href) }}
                          className="p-2 mr-1.5 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-200"
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
                            <Link key={child.href} href={child.href}>
                              <span className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                                childActive
                                  ? "bg-indigo-600/10 text-indigo-700 font-semibold dark:bg-indigo-500/15 dark:text-indigo-300"
                                  : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 font-medium dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                              }`}>
                                <ChildIcon className={`w-4 h-4 ${childActive ? "text-indigo-600 dark:text-indigo-300" : "text-slate-400 dark:text-slate-500"}`} />
                                <span className="text-[13px] tracking-wide truncate">{child.name}</span>
                              </span>
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
      </div>
      
      <div className="mt-auto pt-6 border-t border-slate-200/50 space-y-1 dark:border-slate-800">
        <p className="text-xs font-bold text-slate-400/80 uppercase tracking-widest mb-3 px-3 dark:text-slate-500">Quick Links</p>
        <Link href="/dashboard">
          <span className="flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 font-medium transition-all duration-200 group dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100">
            <Home className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300" />
            <span className="text-sm tracking-wide">User Dashboard</span>
          </span>
        </Link>
        <form action="/api/auth/signout" method="post">
          <button type="submit" className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 font-medium transition-all duration-200 group dark:text-slate-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-300">
            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-rose-500 dark:text-slate-500 dark:group-hover:text-rose-300" />
            <span className="text-sm tracking-wide">Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
