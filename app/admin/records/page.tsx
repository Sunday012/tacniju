import Link from "next/link"
import { Award, BookMarked } from "lucide-react"

const recordsItems = [
  { label: "Dreams", href: "/admin/records/dreams", icon: BookMarked },
  { label: "Points", href: "/admin/points", icon: Award },
]

export default function AdminRecordsPage() {
  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-[1600px] mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Records</h1>
        <p className="mt-2 font-medium text-slate-500">Keep protected member records, dreams, and points in one place.</p>
      </div>

      <section className="rounded-2xl border border-white/70 bg-white p-5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col gap-2">
          {recordsItems.map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600">
                  <Icon className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-800 sm:text-base">{item.label}</h2>
              </Link>
            )
          })}
        </div>
      </section>
    </main>
  )
}
