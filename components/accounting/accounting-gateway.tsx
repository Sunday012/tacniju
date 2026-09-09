 "use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function AccountingGateway({ orgName, dashboardHref = "/dashboard" }: { orgName: string; dashboardHref?: string }) {
  const router = useRouter()
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  const currentPeriod = `1-Jan-${new Date().getFullYear()} to 31-Dec-${new Date().getFullYear()}`

  useEffect(() => {
    const hotkeys: Record<string, string> = {
      a: "/accounting/info",
      i: "/accounting/inventory",
      v: "/accounting/vouchers",
      n: "/accounting/inventory-vouchers",
      r: "/accounting/production",
      b: "/accounting/balance-sheet",
      p: "/accounting/profit-loss",
      s: "/accounting/stock-summary",
      t: "/accounting/statements",
      d: "/accounting/display",
      q: dashboardHref,
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable
      ) {
        return
      }

      const destination = hotkeys[event.key.toLowerCase()]
      if (!destination) return

      event.preventDefault()
      router.push(destination)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router, dashboardHref])

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="hidden md:flex bg-indigo-950 border-b-[3px] border-amber-400 text-indigo-100 text-xs px-5 py-1.5 gap-8 font-semibold dark:bg-slate-900">
        {["Print", "Export", "E-Mail", "Upload", "Services", "Language", "Keyboard", "Help"].map(item => (
          <span key={item} className="whitespace-nowrap">
            <span className="text-amber-400 font-black underline mr-1">{item[0]}</span>: {item}
          </span>
        ))}
      </div>

      <div className="bg-indigo-950 text-white shadow-sm dark:bg-slate-900">
        <div className="flex items-center justify-between px-5 py-3">
          <h1 className="font-black tracking-wide">CHURCH ACCOUNTING PORTAL</h1>
          <Link href={dashboardHref} className="rounded-lg border border-indigo-700 bg-white/10 px-4 py-2 text-sm font-bold text-indigo-100 hover:bg-white/15">
            Dashboard
          </Link>
        </div>
      </div>

      <main className="mx-auto grid max-w-[1500px] gap-8 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_430px]">
        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] dark:border-slate-800 dark:bg-slate-900/80">
          <div className="mb-8 grid overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-indigo-100 p-5 text-center sm:border-b-0 sm:border-r dark:border-slate-800">
              <p className="text-xs font-black uppercase tracking-widest text-indigo-500">Current Period</p>
              <p className="mt-2 text-lg font-bold text-slate-700 dark:text-slate-200">{currentPeriod}</p>
            </div>
            <div className="p-5 text-center">
              <p className="text-xs font-black uppercase tracking-widest text-indigo-500">Current Date</p>
              <p className="mt-2 text-lg font-bold text-slate-700 dark:text-slate-200">{today}</p>
            </div>
          </div>

          <div className="mx-auto mb-8 flex max-w-3xl items-center gap-5">
            <div className="h-px flex-1 bg-indigo-100 dark:bg-slate-800" />
            <h2 className="text-sm font-black uppercase tracking-[0.25em] text-indigo-900 dark:text-slate-200">List of Selected Churches</h2>
            <div className="h-px flex-1 bg-indigo-100 dark:bg-slate-800" />
          </div>

          <div className="mb-2 flex justify-between px-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
            <span>Name of Assembly</span>
            <span>Date of Last Entry</span>
          </div>
          <div className="flex justify-between rounded-xl border border-indigo-200 bg-white px-5 py-4 font-black text-indigo-950 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
            <span>{orgName}</span>
            <span className="text-slate-500 dark:text-slate-400">{today}</span>
          </div>
        </section>

        <aside className="rounded-[1.5rem] border border-indigo-100 bg-white shadow-[0_18px_50px_-24px_rgba(49,46,129,0.45)] dark:border-slate-800 dark:bg-slate-900">
          <div className="rounded-t-[1.5rem] border-b-[3px] border-amber-400 bg-indigo-950 px-5 py-4 text-center text-lg font-black text-white dark:bg-slate-800">
            Accounting Gateway
          </div>
          <div className="space-y-7 p-6">
            <GatewaySection title="Masters">
              <GatewayLink href="/accounting/info" hotkey="A" label="Accounts Info" />
              <GatewayLink href="/accounting/inventory" hotkey="I" label="Inventory Info" />
            </GatewaySection>

            <GatewaySection title="Transactions">
              <GatewayLink href="/accounting/vouchers" hotkey="V" label="Accounting Vouchers" />
              <GatewayLink href="/accounting/inventory-vouchers" hotkey="N" label="Inventory Vouchers" />
              <GatewayLink href="/accounting/programs" hotkey="G" label="Programs" />
            </GatewaySection>

            <GatewaySection title="Reports">
              <GatewayLink href="/accounting/balance-sheet" hotkey="B" label="Balance Sheet" />
              <GatewayLink href="/accounting/profit-loss" hotkey="P" label="Profit & Loss A/c" />
              <GatewayLink href="/accounting/stock-summary" hotkey="S" label="Stock Summary" />
              <GatewayLink href="/accounting/statements" hotkey="T" label="Statements" />
              <GatewayLink href="/accounting/display" hotkey="D" label="Display" />
            </GatewaySection>

            <Link href={dashboardHref} className="block rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center font-black text-slate-700 shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              <span className="text-red-600">Q</span>uit to Dashboard
            </Link>
          </div>
        </aside>
      </main>
    </div>
  )
}

function GatewaySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{title}</p>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function GatewayLink({
  href,
  hotkey,
  label,
  compact = false,
  hotkeyClassName = "text-indigo-700",
}: {
  href: string
  hotkey: string
  label: string
  compact?: boolean
  hotkeyClassName?: string
}) {
  return (
    <Link
      href={href}
      className={`block rounded-md border border-slate-200 bg-white text-center font-bold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700 ${compact ? "px-3 py-1 text-sm" : "px-4 py-1.5"}`}
    >
      <span className={`font-black ${hotkeyClassName}`}>{hotkey}</span>: {label}
    </Link>
  )
}
