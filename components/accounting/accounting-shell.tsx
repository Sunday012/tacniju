import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const navItems = [
  { href: "/accounting/info", label: "Accounts Info" },
  { href: "/accounting/vouchers", label: "Vouchers" },
  { href: "/accounting/voucher-designer", label: "New Creation" },
  { href: "/accounting/inventory-vouchers", label: "Inventory Vouchers" },
  { href: "/accounting/programs", label: "Programs" },
  { href: "/accounting/production", label: "Production" },
  { href: "/accounting/inventory", label: "Inventory Info" },
  { href: "/accounting/statements", label: "Statements" },
  { href: "/accounting/display", label: "Display" },
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
    compact?: boolean
    className?: string
    eyebrowClassName?: string
    badgeClassName?: string
  }
}) {
  return (
    <div className="min-h-screen bg-[#F4F7FA] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="bg-indigo-950 text-white border-b-[3px] border-amber-400 shadow-sm dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href={backHref} className="inline-flex items-center gap-2 rounded-lg border border-amber-400/60 bg-amber-400/15 px-3 py-1.5 text-sm font-bold text-amber-100 shadow-sm transition hover:bg-amber-400/25 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to {backLabel}
          </Link>
          <div className="flex gap-2 overflow-x-auto">
            <Link href="/select-church" className="whitespace-nowrap rounded-lg border border-indigo-700 bg-white/10 px-3 py-1.5 text-xs font-bold text-indigo-100 hover:bg-white/15">
              Switch Church
            </Link>
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-lg border border-indigo-700 bg-white/10 px-3 py-1.5 text-xs font-bold text-indigo-100 hover:bg-white/15">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-10">
        {hero ? (
          <section className={`relative overflow-hidden text-white ${hero.compact ? "mb-4 rounded-xl px-4 py-3 sm:mb-5 sm:px-7 sm:py-5" : "mb-8 rounded-[2rem] px-6 py-8 shadow-[0_18px_50px_-22px_rgba(15,23,42,0.35)] sm:px-10"} ${hero.className || "bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900"}`}>
            <div className="absolute right-0 top-0 h-64 w-64 translate-x-20 -translate-y-16 rounded-full bg-white/10" />
            <div className="absolute bottom-0 right-28 h-44 w-44 translate-y-20 rounded-full bg-purple-950/10" />
            <div className={`relative z-10 flex ${hero.compact ? "items-center justify-end sm:justify-between" : "flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"}`}>
              <div className={hero.compact ? "hidden sm:block" : ""}>
                <p className={`text-xs font-black uppercase tracking-[0.28em] ${hero.eyebrowClassName || "text-indigo-100"}`}>{hero.eyebrow || "Accounting Voucher"}</p>
                <h1 className={`mt-3 font-black tracking-tight ${hero.compact ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl"}`}>{hero.title}</h1>
                {hero.subtitle && (
                  <p className="mt-3 max-w-2xl text-lg font-semibold leading-8 text-indigo-100">{hero.subtitle}</p>
                )}
              </div>
              {hero.badge && (
                <div className={`shrink-0 bg-white font-black ${hero.compact ? "rounded-md px-4 py-2 text-sm sm:rounded-lg sm:px-5 sm:py-3 sm:text-base" : "rounded-2xl px-7 py-4 text-lg shadow-sm"} ${hero.badgeClassName || "text-indigo-700"}`}>
                  {hero.badge}
                </div>
              )}
            </div>
          </section>
        ) : showTitle ? (
          <h1 className="mb-8 text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
        ) : null}
        {framed ? (
          <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] backdrop-blur-3xl sm:p-5 dark:border-slate-800 dark:bg-slate-900/80">
            {children}
          </div>
        ) : children}
      </main>
    </div>
  )
}
