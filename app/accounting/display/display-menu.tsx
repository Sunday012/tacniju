import Link from "next/link"
import {
  AlertTriangle,
  BookOpen,
  Boxes,
  FolderTree,
  Landmark,
  Layers,
  LineChart,
  Package,
  Receipt,
  Scale,
  ScrollText,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type DisplayMenuItem = {
  label: string
  icon: LucideIcon
  href?: string
  slug?: string
  children?: DisplayMenuItem[]
}

export const displayMenuItems: DisplayMenuItem[] = [
  {
    label: "Trial Balance",
    icon: Scale,
    href: "/reports/trial-balance",
  },
  {
    label: "Day Book",
    icon: BookOpen,
    href: "/accounting/day-book",
  },
  {
    label: "Account Book",
    icon: ScrollText,
    slug: "account-book",
    children: [
      { label: "Cash / Bank Book", icon: Landmark, href: "/accounting/info/bank-account" },
      { label: "Ledger", icon: BookOpen, href: "/accounting/info/ledger" },
      { label: "Group Summary", icon: Layers, href: "/accounting/info/group" },
      { label: "Sales Register", icon: Receipt, href: "/accounting/vouchers/sales" },
      { label: "Purchase Register", icon: Receipt, href: "/accounting/vouchers/purchase" },
      { label: "Payment / Receipt Register", icon: Receipt, href: "/accounting/day-book" },
    ],
  },
  {
    label: "Statement of Accounts",
    icon: Receipt,
    slug: "statement-of-accounts",
    children: [
      { label: "Outstanding Receivables", icon: Receipt, href: "/accounting/statements/party" },
      { label: "Outstanding Payables", icon: Receipt, href: "/accounting/statements/party" },
      { label: "Ledger Monthly Summary", icon: BookOpen, href: "/accounting/info/ledger" },
      { label: "Statistics", icon: LineChart, href: "/accounting/profit-loss" },
    ],
  },
  {
    label: "Inventory Book",
    icon: Package,
    slug: "inventory-book",
    children: [
      { label: "Stock Item", icon: Package, href: "/accounting/inventory" },
      { label: "Category", icon: FolderTree, href: "/accounting/production/inventory/categories" },
      { label: "Physical Stock Register", icon: BookOpen, href: "/accounting/production/reports/stock" },
      { label: "Batch", icon: Boxes, href: "/accounting/production/stock-journal" },
    ],
  },
  {
    label: "Statement of Inventory",
    icon: Boxes,
    slug: "statement-of-inventory",
    children: [
      { label: "Category Summary", icon: FolderTree, href: "/accounting/stock-summary" },
      { label: "Sales Bill Pending", icon: Receipt, href: "/accounting/vouchers/sales" },
      { label: "Purchase Bill Pending", icon: Receipt, href: "/accounting/vouchers/purchase" },
      { label: "Non Allocated Payment", icon: Receipt, href: "/accounting/vouchers/payment" },
      { label: "Expense Bill Pending", icon: Receipt, href: "/accounting/vouchers/expense" },
    ],
  },
  {
    label: "Cash / Funds Flow",
    icon: LineChart,
    href: "/accounting/statements/cash-in-hand",
  },
  {
    label: "Chart of Accounts",
    icon: FolderTree,
    href: "/accounting/chart-of-accounts",
  },
  {
    label: "Exception Reports",
    icon: AlertTriangle,
    slug: "exception-reports",
    children: [
      { label: "Negative Stock", icon: AlertTriangle, href: "/accounting/production/reports/stock" },
      { label: "Negative Ledgers", icon: AlertTriangle, href: "/reports/trial-balance" },
      { label: "Negative Batch", icon: AlertTriangle, href: "/accounting/production/reports/stock" },
    ],
  },
]

export function getDisplayMenuSection(slug: string) {
  return displayMenuItems.find(item => item.slug === slug && item.children)
}

export function DisplayMenuList({ items }: { items: DisplayMenuItem[] }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map(item => (
        <DisplayMenuRow key={item.label} item={item} />
      ))}
    </div>
  )
}

function DisplayMenuRow({ item }: { item: DisplayMenuItem }) {
  const Icon = item.icon
  const href = item.children ? `/accounting/display/${item.slug}` : item.href
  const content = (
    <>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600">
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="text-sm font-bold text-slate-800 sm:text-base">{item.label}</h2>
    </>
  )

  if (!href) {
    return (
      <div className="flex min-h-12 items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-slate-400 shadow-sm">
        {content}
      </div>
    )
  }

  return (
    <Link
      href={href}
      className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
    >
      {content}
    </Link>
  )
}
