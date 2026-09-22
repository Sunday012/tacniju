import Image from "next/image"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  ArrowLeft,
  Award,
  Banknote,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ClipboardList,
  FileText,
  FolderCheck,
  HeartHandshake,
  Landmark,
  MapPin,
  Mic2,
  Music2,
  Presentation,
  ScanLine,
  Settings,
  Stethoscope,
  Trophy,
  UserPlus,
  UsersRound,
  UtensilsCrossed,
  WalletCards,
} from "lucide-react"

export type OfficeTool = {
  href: string
  label: string
  description: string
  icon: LucideIcon
}

export type AdminMenuNode = OfficeTool & {
  slug: string
  children?: AdminMenuNode[]
  emptyMessage?: string
}

const officePath = (...parts: string[]) => `/admin/office/${parts.join("/")}`
const fileQueue = (unit: string) => `/admin/office/admin-office/files?unit=${encodeURIComponent(unit)}`

export const adminOfficeMainAreas: AdminMenuNode[] = [
  {
    slug: "admin-office",
    href: officePath("admin-office"),
    label: "Admin Office",
    description: "Head Office and the Admin Control Unit.",
    icon: Landmark,
    children: [
      {
        slug: "head-office",
        href: officePath("admin-office", "head-office"),
        label: "Head Office",
        description: "Office desk, records and reports, and system tools.",
        icon: Building2,
        children: [
          { slug: "desk", href: officePath("admin-office", "desk"), label: "Desk", description: "Budget, awards, files, and appointments.", icon: ClipboardList },
          { slug: "records", href: officePath("admin-office", "records"), label: "Records & Reports", description: "Overview, locations, treasury, and pending work.", icon: FolderCheck },
          { slug: "system", href: officePath("admin-office", "system"), label: "System", description: "System administration controls.", icon: Settings },
        ],
      },
      {
        slug: "admin-control-unit",
        href: officePath("admin-office", "admin-control-unit"),
        label: "Admin Control Unit",
        description: "Administrative control tools.",
        icon: Settings,
        emptyMessage: "No tools have been added to the Admin Control Unit yet.",
      },
    ],
  },
  {
    slug: "secretariat",
    href: officePath("secretariat"),
    label: "Secretariat",
    description: "Secretaries, Financial Secretary, and Assistants.",
    icon: ClipboardList,
    children: [
      {
        slug: "secretaries",
        href: officePath("secretariat", "secretaries"),
        label: "Secretaries",
        description: "Secretarial desk, events, and records.",
        icon: ClipboardList,
        children: [
          {
            slug: "desk",
            href: officePath("secretariat", "secretaries", "desk"),
            label: "Desk",
            description: "Program proposals, invitation letters, and files.",
            icon: ClipboardList,
            children: [
              { slug: "program-proposal", href: fileQueue("Secretaries"), label: "Program Proposals", description: "Review directors' program proposal memos.", icon: ClipboardList },
              { slug: "invitation-letter", href: "/admin/announcements", label: "Invitation Letter", description: "Prepare and publish an invitation letter.", icon: FileText },
              { slug: "files", href: fileQueue("Secretaries"), label: "Files", description: "Review files sent to the Secretaries desk.", icon: FolderCheck },
            ],
          },
          { slug: "event", href: "/admin/events", label: "Event", description: "Create and manage events.", icon: CalendarDays },
          {
            slug: "records-reports",
            href: officePath("secretariat", "secretaries", "records-reports"),
            label: "Records & Reports",
            description: "Reservations, announcements, departments, and order of service.",
            icon: FolderCheck,
            children: [
              { slug: "reservation", href: "/admin/reservations", label: "Reservation", description: "Review reservations.", icon: UsersRound },
              { slug: "announcement", href: "/admin/announcements", label: "Announcement", description: "Prepare announcements.", icon: Mic2 },
              { slug: "department", href: "/admin/departments", label: "Department", description: "Manage departments.", icon: Building2 },
              { slug: "order-of-service", href: "/admin/presenter", label: "Order of Service", description: "Prepare the order of service.", icon: Presentation },
            ],
          },
        ],
      },
      {
        slug: "financial-secretary",
        href: officePath("secretariat", "financial-secretary"),
        label: "Financial Secretary",
        description: "Finance, accounting, and sales work.",
        icon: WalletCards,
        children: [
          {
            slug: "finance-officer",
            href: officePath("secretariat", "financial-secretary", "finance-officer"),
            label: "Finance Officer",
            description: "Program, files, and records.",
            icon: WalletCards,
            children: [
              { slug: "program", href: "/accounting/programs", label: "Program", description: "Open program planning.", icon: ClipboardList },
              { slug: "files", href: fileQueue("Finance Officer"), label: "Files", description: "Review finance files.", icon: FolderCheck },
              { slug: "records", href: "/accounting", label: "Records", description: "Open financial records.", icon: FileText },
            ],
          },
          { slug: "account-officer", href: "/accounting", label: "Account Officer", description: "Open Accounting.", icon: Landmark },
          {
            slug: "sale-unit",
            href: officePath("secretariat", "financial-secretary", "sale-unit"),
            label: "Sale Unit",
            description: "Sales, stall orders, and meal tickets.",
            icon: Banknote,
            children: [
              { slug: "sales-form", href: "/accounting/display/sales-register", label: "Sales Form", description: "Record and review sales.", icon: Banknote },
              { slug: "stall-orders", href: "/admin/stalls", label: "Stall Orders", description: "Manage stall orders.", icon: ClipboardList },
              { slug: "meal-tickets", href: "/admin/meal-tickets", label: "Meal Tickets", description: "Manage meal tickets.", icon: UtensilsCrossed },
            ],
          },
        ],
      },
      {
        slug: "assistants",
        href: officePath("secretariat", "assistants"),
        label: "Assistants",
        description: "The main records desk.",
        icon: UsersRound,
        children: [
          {
            slug: "records",
            href: officePath("secretariat", "assistants", "records"),
            label: "Main Records",
            description: "Open the shared records collection.",
            icon: FolderCheck,
            children: [
              { slug: "dreams", href: "/admin/records/dreams", label: "Dreams", description: "Dream records.", icon: FileText },
              { slug: "teachings", href: "/admin/records/teachings", label: "Teachings", description: "Teaching records.", icon: FileText },
              { slug: "prophecy", href: "/admin/records/prophecies", label: "Prophecy", description: "Prophecy records.", icon: FileText },
              { slug: "lyrics", href: "/admin/records/lyrics", label: "Lyrics", description: "Lyrics records.", icon: Music2 },
              { slug: "events", href: "/admin/events", label: "Events", description: "Event records.", icon: CalendarDays },
              { slug: "competition", href: "/admin/competitions", label: "Competition", description: "Competition records.", icon: Trophy },
              { slug: "battles", href: "/admin/battles", label: "Battles", description: "Battle records.", icon: Trophy },
              { slug: "gifts", href: "/admin/points", label: "Gifts", description: "Gift and points records.", icon: Award },
              { slug: "points", href: "/admin/points", label: "Points", description: "Points records.", icon: Award },
              { slug: "dining-hall", href: "/admin/dining-hall", label: "Dining Hall", description: "Dining hall records.", icon: UtensilsCrossed },
              { slug: "meal-tickets", href: "/admin/meal-tickets", label: "Meal Tickets", description: "Meal ticket records.", icon: UtensilsCrossed },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "directors",
    href: officePath("directors"),
    label: "Directors",
    description: "Music, Welfare, and Ushering directors.",
    icon: BriefcaseBusiness,
    children: [
      {
        slug: "music",
        href: officePath("directors", "music"),
        label: "Music",
        description: "Music direction and service preparation.",
        icon: Music2,
        children: [
          {
            slug: "desk",
            href: officePath("directors", "music", "desk"),
            label: "Desk",
            description: "Program proposal, awards, lyrics, and events.",
            icon: Music2,
            children: [
              { slug: "program-proposal", href: "/admin/office/directors/program-proposal?director=Music", label: "Program Proposal", description: "Send a proposal memo to the Secretariat.", icon: ClipboardList },
              { slug: "award-creation", href: "/admin/awards", label: "Award Creation", description: "Create awards.", icon: Award },
              { slug: "lyrics", href: "/admin/records/lyrics", label: "Lyrics", description: "Open lyrics.", icon: Music2 },
              { slug: "event", href: "/admin/events", label: "Event", description: "Open events.", icon: CalendarDays },
            ],
          },
        ],
      },
      {
        slug: "welfare",
        href: officePath("directors", "welfare"),
        label: "Welfare",
        description: "Welfare, kitchen, meals, and inventory.",
        icon: HeartHandshake,
        children: [
          {
            slug: "desk",
            href: officePath("directors", "welfare", "desk"),
            label: "Desk",
            description: "Welfare operational tools.",
            icon: HeartHandshake,
            children: [
              { slug: "program-proposal", href: "/admin/office/directors/program-proposal?director=Welfare", label: "Program Proposal", description: "Send a proposal memo to the Secretariat.", icon: ClipboardList },
              { slug: "members", href: "/admin/diary", label: "List of Members", description: "Open the member list.", icon: UsersRound },
              { slug: "meal-ticket", href: "/admin/meal-tickets", label: "Meal Ticket", description: "Open meal tickets.", icon: UtensilsCrossed },
              { slug: "dining-hall", href: "/admin/dining-hall", label: "Dining Hall", description: "Open dining hall records.", icon: UtensilsCrossed },
              { slug: "kitchen-unit", href: "/admin/dining-hall/kitchen", label: "Kitchen Unit", description: "Open kitchen unit records.", icon: UtensilsCrossed },
              { slug: "kitchen", href: "/accounting/inventory/consumption/kitchen", label: "Kitchen", description: "Open kitchen consumption.", icon: UtensilsCrossed },
              { slug: "batch", href: "/accounting/inventory/production/batch-summary", label: "Batch", description: "Open stock batches.", icon: ClipboardList },
              { slug: "inventory-report", href: "/accounting/inventory/reports", label: "Inventory Report", description: "Open inventory reports.", icon: FileText },
              {
                slug: "medical-unit",
                href: officePath("directors", "welfare", "desk", "medical-unit"),
                label: "Medical Unit",
                description: "Medical unit workspace.",
                icon: Stethoscope,
                emptyMessage: "No medical unit tools have been added yet.",
              },
              { slug: "report", href: "/accounting/inventory/reports", label: "Report", description: "Open welfare inventory reports.", icon: FileText },
            ],
          },
        ],
      },
      {
        slug: "ushering",
        href: officePath("directors", "ushering"),
        label: "Ushering",
        description: "Attendance, scanning, and member records.",
        icon: ScanLine,
        children: [
          {
            slug: "desk",
            href: officePath("directors", "ushering", "desk"),
            label: "Desk",
            description: "Program, scanner, events, and member list.",
            icon: ScanLine,
            children: [
              { slug: "program-proposal", href: "/admin/office/directors/program-proposal?director=Ushering", label: "Program Proposal", description: "Send a proposal memo to the Secretariat.", icon: ClipboardList },
              { slug: "scanner", href: "/admin/scanner", label: "Scanner", description: "Open attendance scanner.", icon: ScanLine },
              { slug: "event", href: "/admin/events", label: "Event", description: "Open events.", icon: CalendarDays },
              { slug: "members", href: "/admin/diary", label: "List of Members", description: "Open the member list.", icon: UsersRound },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "media-unit",
    href: officePath("media-unit"),
    label: "Media Unit",
    description: "Presentation tools.",
    icon: Presentation,
    children: [
      { slug: "presentation", href: "/admin/presenter", label: "Presentation", description: "Open the presentation suite.", icon: Presentation },
    ],
  },
]

export const adminOfficeDeskTools: OfficeTool[] = [
  { href: officePath("admin-office", "budget"), label: "Budget", description: "Create, edit, and delete event budgets.", icon: ClipboardList },
  { href: "/admin/awards", label: "Awards", description: "Manage recognition and awards.", icon: Award },
  { href: fileQueue("Head Office"), label: "Files", description: "New, approved, and rejected Head Office files.", icon: FolderCheck },
  { href: officePath("admin-office", "appointments"), label: "Appointments", description: "Create, change, and review appointments.", icon: UserPlus },
]

export const adminOfficeRecordTools: OfficeTool[] = [
  { href: "/admin/diary", label: "Overview", description: "Open the membership overview.", icon: UsersRound },
  { href: "/admin/diary/locations", label: "Location", description: "Review districts and assemblies.", icon: MapPin },
  { href: "/accounting/balance-sheet", label: "Treasury", description: "Review balances and treasury position.", icon: WalletCards },
  { href: "/admin/announcements", label: "Pending", description: "Review pending announcements and notices.", icon: Mic2 },
]

export const adminOfficeSystemTools: OfficeTool[] = [
  { href: "/admin/system", label: "System Control", description: "Open system administration.", icon: Settings },
]

export function resolveAdminMenuNode(office: string, sections: string[] = []) {
  let node = adminOfficeMainAreas.find((area) => area.slug === office)
  for (const section of sections) {
    node = node?.children?.find((child) => child.slug === section)
  }
  return node
}

export function AdminOfficeMainMenu() {
  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Main Menu</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">Admin Offices</h1>
          <p className="mt-2 max-w-2xl text-slate-500">Choose an office area to open its desk, records, and working tools.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {adminOfficeMainAreas.map((area) => {
            const Icon = area.icon
            return (
              <Link key={area.slug} href={area.href} className="group border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-slate-200 bg-slate-50 p-2">
                    <Image src="https://res.cloudinary.com/dzckvrvu9/image/upload/v1777993333/WhatsApp_Image_2026-05-01_at_08.37.56-removebg-preview_a8w3wt.png" alt="TACN logo" width={44} height={44} className="h-full w-full object-contain" />
                  </div>
                  <Icon className="h-5 w-5 text-indigo-600 transition-transform group-hover:scale-110" />
                </div>
                <h2 className="mt-8 text-xl font-extrabold text-slate-900">{area.label}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{area.description}</p>
                <p className="mt-5 text-sm font-bold text-indigo-700">Open office area</p>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}

export function AdminOfficeDirectory({ node, backHref }: { node: AdminMenuNode; backHref: string }) {
  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10">
      <div className="w-full">
        <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-700">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="mt-6 border-b border-slate-200 pb-6">
          <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Admin Menu</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">{node.label}</h1>
          <p className="mt-2 max-w-2xl text-slate-500">{node.description}</p>
        </div>

        {node.children?.length ? (
          <div className="mt-6 grid w-full gap-2">
            {node.children.map((child) => {
              const Icon = child.icon
              return (
                <Link key={child.slug} href={child.href} title={child.description} className="flex min-h-14 items-center gap-3 border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-indigo-300 hover:bg-slate-50 hover:shadow-md">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-slate-200 bg-slate-50 text-slate-600"><Icon className="h-4 w-4" /></span>
                  <span className="text-sm font-bold text-slate-800 sm:text-base">{child.label}</span>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="mt-6 border border-slate-200 bg-white px-4 py-8 text-sm text-slate-500">{node.emptyMessage || "No tools have been added here yet."}</div>
        )}
      </div>
    </main>
  )
}

export function AdminOfficeSubmenu({ title, description, tools }: { title: string; description: string; tools: OfficeTool[] }) {
  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10">
      <div className="w-full">
        <Link href={officePath("admin-office", "head-office")} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Head Office
        </Link>
        <div className="mt-6 border-b border-slate-200 pb-6">
          <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Head Office</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">{title}</h1>
          <p className="mt-2 max-w-2xl text-slate-500">{description}</p>
        </div>
        <div className="mt-6 grid w-full gap-2">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link key={tool.href} href={tool.href} title={tool.description} className="flex min-h-14 items-center gap-3 border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-indigo-300 hover:bg-slate-50 hover:shadow-md">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-slate-200 bg-slate-50 text-slate-600"><Icon className="h-4 w-4" /></span>
                <span className="text-sm font-bold text-slate-800 sm:text-base">{tool.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
