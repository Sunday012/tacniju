import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const navItems = [
  { href: "/accounting/info", label: "Accounts Info" },
  { href: "/accounting/banking", label: "Banking" },
  { href: "/accounting/vouchers", label: "Vouchers" },
  { href: "/accounting/programs", label: "Programs" },
  { href: "/accounting/inventory", label: "Inventory" },
  { href: "/accounting/day-book", label: "Day Book" },
]

export function AccountingShell({
  title,
  children,
  framed = true,
  showTitle = true,
  hero,
  backHref = "/accounting",
  backLabel = "Gateway",
}: {
  title: string
  children: React.ReactNode
  framed?: boolean
  showTitle?: boolean
  backHref?: string
  backLabel?: string
  hero?: {
    title: string
    subtitle?: string
    badge?: string
    eyebrow?: string
    className?: string
    eyebrowClassName?: string
    badgeClassName?: string
  }
}) {
  return (
    <div className="min-h-screen bg-[#F4F7FA] text-slate-900">
      <div className="bg-indigo-950 text-white border-b-[3px] border-amber-400 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href={backHref} className="inline-flex items-center gap-2 rounded-lg border border-amber-400/60 bg-amber-400/15 px-3 py-1.5 text-sm font-bold text-amber-100 shadow-sm transition hover:bg-amber-400/25 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to {backLabel}
          </Link>
          <div className="flex gap-2 overflow-x-auto">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-lg border border-indigo-700 bg-white/10 px-3 py-1.5 text-xs font-bold text-indigo-100 hover:bg-white/15">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10">
        {hero ? (
          <section className={`relative mb-8 overflow-hidden rounded-[2rem] px-6 py-8 text-white shadow-[0_18px_50px_-22px_rgba(15,23,42,0.35)] sm:px-10 ${hero.className || "bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900"}`}>
            <div className="absolute right-0 top-0 h-64 w-64 translate-x-20 -translate-y-16 rounded-full bg-white/10" />
            <div className="absolute bottom-0 right-28 h-44 w-44 translate-y-20 rounded-full bg-purple-950/10" />
            <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className={`text-xs font-black uppercase tracking-[0.28em] ${hero.eyebrowClassName || "text-indigo-100"}`}>{hero.eyebrow || "Accounting Voucher"}</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{hero.title}</h1>
                {hero.subtitle && (
                  <p className="mt-3 max-w-2xl text-lg font-semibold leading-8 text-indigo-100">{hero.subtitle}</p>
                )}
              </div>
              {hero.badge && (
                <div className={`shrink-0 rounded-2xl bg-white px-7 py-4 text-lg font-black shadow-sm ${hero.badgeClassName || "text-indigo-700"}`}>
                  {hero.badge}
                </div>
              )}
            </div>
          </section>
        ) : showTitle ? (
          <h1 className="mb-8 text-3xl font-black tracking-tight text-slate-900">{title}</h1>
        ) : null}
        {framed ? (
          <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] backdrop-blur-3xl sm:p-8">
            {children}
          </div>
        ) : children}
      </main>
    </div>
  )
}
