import Link from "next/link"
import type { LucideIcon } from "lucide-react"

export type AccountingMenuItem = {
  href: string
  label: string
  icon: LucideIcon
}

export function AccountingMenuRow({ item }: { item: AccountingMenuItem }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600">
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="text-sm font-bold text-slate-800 sm:text-base">{item.label}</h2>
    </Link>
  )
}

export function AccountingMenuList({ items }: { items: AccountingMenuItem[] }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map(item => <AccountingMenuRow key={item.href} item={item} />)}
    </div>
  )
}
