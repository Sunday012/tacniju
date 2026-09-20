import Link from "next/link"
import { ArrowLeft, Check, FilePlus2, X } from "lucide-react"

const fileQueueContexts = {
  "Head Office": { backHref: "/admin/office/admin-office/desk" },
  Secretaries: { backHref: "/admin/office/secretariat/secretaries/desk" },
  "Finance Officer": { backHref: "/admin/office/secretariat/financial-secretary/finance-officer" },
} as const

function getFileQueue(unit?: string) {
  return unit && unit in fileQueueContexts ? unit as keyof typeof fileQueueContexts : "Head Office"
}

export default function AdminOfficeFilesPage({ searchParams }: { searchParams: { unit?: string } }) {
  const unit = getFileQueue(searchParams.unit)
  const query = `?unit=${encodeURIComponent(unit)}`
  const fileSections = [
    { href: `/admin/office/admin-office/files/new${query}`, label: "New", icon: FilePlus2 },
    { href: `/admin/office/admin-office/files/approved${query}`, label: "Approved", icon: Check },
    { href: `/admin/office/admin-office/files/rejected${query}`, label: "Rejected", icon: X },
  ]

  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10">
      <div className="w-full">
        <Link href={fileQueueContexts[unit].backHref} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Desk
        </Link>
        <div className="mt-6 border-b border-slate-200 pb-6">
          <p className="text-xs font-black uppercase tracking-widest text-indigo-600">{unit}</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Files</h1>
          <p className="mt-2 text-slate-500">Open a section to review {unit.toLowerCase()} files by their current status.</p>
        </div>

        <div className="mt-6 grid w-full gap-2">
          {fileSections.map((section) => {
            const Icon = section.icon
            return (
              <Link key={section.href} href={section.href} className="flex min-h-14 items-center gap-3 border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-indigo-300 hover:bg-slate-50 hover:shadow-md">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-slate-200 bg-slate-50 text-slate-600">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-bold text-slate-800 sm:text-base">{section.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
