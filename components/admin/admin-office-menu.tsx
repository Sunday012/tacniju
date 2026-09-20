import Image from "next/image"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  CalendarDays,
  ClipboardList,
  HeartHandshake,
  Landmark,
  Mic2,
  Music2,
  Presentation,
  ScanLine,
  ShieldCheck,
  UsersRound,
  UtensilsCrossed,
} from "lucide-react"

export type AdminOfficeSlug =
  | "admin-office"
  | "secretariat"
  | "music-director"
  | "welfare-director"
  | "ushering-director"
  | "media-unit"

type OfficeTool = {
  href: string
  label: string
  description: string
  icon: LucideIcon
}

export type AdminOffice = {
  slug: AdminOfficeSlug
  name: string
  description: string
  icon: LucideIcon
  tools: OfficeTool[]
}

export const adminOffices: AdminOffice[] = [
  {
    slug: "admin-office",
    name: "Admin Office",
    description: "Head office, system records, and administration.",
    icon: Landmark,
    tools: [
      { href: "/accounting/programs/budget", label: "Budget", description: "Create and manage event budgets.", icon: ClipboardList },
      { href: "/admin/awards", label: "Awards", description: "Manage recognition and awards.", icon: ShieldCheck },
      { href: "/admin/diary", label: "Records & Reports", description: "Open the member diary and records.", icon: UsersRound },
      { href: "/admin/system", label: "System", description: "Open system settings and archive tools.", icon: ShieldCheck },
    ],
  },
  {
    slug: "secretariat",
    name: "Secretariat",
    description: "Events, reservations, notices, and departmental records.",
    icon: ClipboardList,
    tools: [
      { href: "/accounting/programs", label: "Program Proposal", description: "Plan event programs and budgets.", icon: ClipboardList },
      { href: "/admin/events", label: "Events", description: "Create and manage church events.", icon: CalendarDays },
      { href: "/admin/reservations", label: "Reservations", description: "Review member reservations.", icon: UsersRound },
      { href: "/admin/announcements", label: "Announcements", description: "Prepare and publish notices.", icon: Mic2 },
      { href: "/admin/departments", label: "Departments", description: "Manage departments and units.", icon: UsersRound },
      { href: "/admin/presenter", label: "Order of Service", description: "Open the service presentation desk.", icon: Presentation },
    ],
  },
  {
    slug: "music-director",
    name: "Music Director",
    description: "Music records, lyrics, and service preparation.",
    icon: Music2,
    tools: [
      { href: "/admin/records/lyrics", label: "Lyrics", description: "Create, organise, and search song lyrics.", icon: Music2 },
      { href: "/admin/presenter", label: "Presentation", description: "Prepare the display for a service.", icon: Presentation },
      { href: "/accounting/programs", label: "Program Proposal", description: "View the event program plan.", icon: ClipboardList },
    ],
  },
  {
    slug: "welfare-director",
    name: "Welfare Director",
    description: "Meals, tickets, kitchen work, and welfare stock.",
    icon: HeartHandshake,
    tools: [
      { href: "/admin/meal-tickets", label: "Meal Tickets", description: "Generate and manage meal tickets.", icon: ClipboardList },
      { href: "/admin/dining-hall", label: "Dining Hall", description: "Coordinate serving and dining records.", icon: UtensilsCrossed },
      { href: "/accounting/inventory/consumption/kitchen", label: "Kitchen", description: "Record kitchen consumption.", icon: UtensilsCrossed },
      { href: "/accounting/inventory", label: "Inventory Report", description: "Review stock movement and reports.", icon: ClipboardList },
    ],
  },
  {
    slug: "ushering-director",
    name: "Ushering Director",
    description: "Attendance, member lists, and scanning.",
    icon: ScanLine,
    tools: [
      { href: "/accounting/programs", label: "Program Proposal", description: "See the program plan for an event.", icon: ClipboardList },
      { href: "/accounting/programs/reports/attendance", label: "Attendance", description: "Review event attendance reports.", icon: UsersRound },
      { href: "/admin/diary", label: "List of Members", description: "Open the member directory and diary.", icon: UsersRound },
      { href: "/admin/scanner", label: "Scanner", description: "Scan and record event attendance.", icon: ScanLine },
    ],
  },
  {
    slug: "media-unit",
    name: "Media Unit",
    description: "Announcements, presentations, and media records.",
    icon: Presentation,
    tools: [
      { href: "/admin/announcements", label: "Announcements", description: "Create and update announcements.", icon: Mic2 },
      { href: "/admin/presenter", label: "Presentation", description: "Control media during a service.", icon: Presentation },
      { href: "/admin/records/teachings", label: "Teachings", description: "Manage teaching records and transcripts.", icon: ClipboardList },
    ],
  },
]

export function getAdminOffice(slug: string) {
  return adminOffices.find((office) => office.slug === slug)
}

export function AdminOfficeMainMenu() {
  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Main Menu</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">Admin Offices</h1>
          <p className="mt-2 max-w-2xl text-slate-500">Choose an office to open its desk, records, and working tools.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {adminOffices.map((office) => {
            const Icon = office.icon
            return (
              <Link
                key={office.slug}
                href={`/admin/office/${office.slug}`}
                className="group border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-slate-200 bg-slate-50 p-2">
                    <Image
                      src="https://res.cloudinary.com/dzckvrvu9/image/upload/v1777993333/WhatsApp_Image_2026-05-01_at_08.37.56-removebg-preview_a8w3wt.png"
                      alt="TACN logo"
                      width={44}
                      height={44}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <Icon className="h-5 w-5 text-indigo-600 transition-transform group-hover:scale-110" />
                </div>
                <h2 className="mt-8 text-xl font-extrabold text-slate-900">{office.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{office.description}</p>
                <p className="mt-5 text-sm font-bold text-indigo-700">Open office desk</p>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}

export function AdminOfficeDesk({ office }: { office: AdminOffice }) {
  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="inline-flex items-center text-sm font-bold text-slate-600 hover:text-indigo-700">
          Back to Main Menu
        </Link>
        <div className="mt-6 border-b border-slate-200 pb-6">
          <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Office Desk</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">{office.name}</h1>
          <p className="mt-2 max-w-2xl text-slate-500">{office.description}</p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {office.tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link key={tool.href} href={tool.href} className="flex min-h-32 flex-col border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow-md">
                <Icon className="h-5 w-5 text-indigo-600" />
                <h2 className="mt-5 text-base font-extrabold text-slate-900">{tool.label}</h2>
                <p className="mt-1 text-sm leading-5 text-slate-500">{tool.description}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
