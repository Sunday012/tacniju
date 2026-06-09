import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Printer } from "lucide-react"

export type AccountingMenuItem = {
  href: string
  label: string
  icon: LucideIcon
  printHref?: string
}

export function AccountingMenuRow({ item }: { item: AccountingMenuItem }) {
  const Icon = item.icon
  return (
    <div className="flex items-center gap-2">
      <Link
        href={item.href}
        className="flex min-h-12 flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-sm font-bold text-slate-800 sm:text-base">{item.label}</h2>
      </Link>
      {item.printHref && (
        <Link
          href={item.printHref}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md"
          title="Print"
        >
          <Printer className="h-5 w-5" />
        </Link>
      )}
    </div>
  )
}

export function AccountingMenuList({ items }: { items: AccountingMenuItem[] }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map(item => <AccountingMenuRow key={item.href} item={item} />)}
    </div>
  )
}
