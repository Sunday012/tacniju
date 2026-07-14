import {
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
import { AccountingMenuRow } from "@/components/accounting/accounting-menu-list"

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
      { label: "Group Summary", icon: Layers, href: "/accounting/display/group-summary" },
      { label: "Sales Register", icon: Receipt, href: "/accounting/display/sales-register" },
      { label: "Income Register", icon: Receipt, href: "/accounting/display/income-register" },
      { label: "Purchase Register", icon: Receipt, href: "/accounting/display/purchase-register" },
      { label: "Expenses Purchase Register", icon: Receipt, href: "/accounting/display/expense-purchase-register" },
      { label: "Payment Register", icon: Receipt, href: "/accounting/display/payment-register" },
      { label: "Receipt Register", icon: Receipt, href: "/accounting/display/receipt-register" },
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
      { label: "Batch Register", icon: Boxes, href: "/accounting/display/batch" },
    ],
  },
  {
    label: "Statement of Inventory",
    icon: Boxes,
    slug: "statement-of-inventory",
    children: [
      { label: "Category Summary", icon: FolderTree, href: "/accounting/stock-summary" },
      { label: "Sales Bill Pending", icon: Receipt, href: "/accounting/display/bill-pending/sales" },
      { label: "Income Bill Pending", icon: Receipt, href: "/accounting/display/bill-pending/income" },
      { label: "Purchase Bill Pending", icon: Receipt, href: "/accounting/display/bill-pending/purchase" },
      { label: "Expense Bill Pending", icon: Receipt, href: "/accounting/display/bill-pending/expense" },
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
  const href = item.children ? `/accounting/display/${item.slug}` : item.href

  if (!href) {
    return (
      <div className="flex min-h-12 items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-slate-400 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <item.icon className="h-4 w-4" />
        </div>
        <h2 className="text-sm font-bold text-slate-800 sm:text-base dark:text-slate-100">{item.label}</h2>
      </div>
    )
  }

  return <AccountingMenuRow item={{ href, label: item.label, icon: item.icon }} />
}
