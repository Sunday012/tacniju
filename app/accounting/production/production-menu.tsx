import Link from "next/link"
import { Boxes, ClipboardList, FileBarChart, FolderTree, Package, ReceiptText, Ruler, ScrollText } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type ProductionMenuItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const productionMenuItems: ProductionMenuItem[] = [
  { label: "Stock Journal", href: "/accounting/production/stock-journal", icon: ClipboardList },
  { label: "Raw Material Journal", href: "/accounting/production/raw-material-journal", icon: ScrollText },
  { label: "Inventory", href: "/accounting/production/inventory", icon: Boxes },
  { label: "Journal Summary", href: "/accounting/production/journal-summary", icon: ReceiptText },
  { label: "Reports", href: "/accounting/production/reports", icon: FileBarChart },
]

export const productionInventoryItems: ProductionMenuItem[] = [
  { label: "Items", href: "/accounting/production/inventory/items", icon: Package },
  { label: "Categories", href: "/accounting/production/inventory/categories", icon: FolderTree },
  { label: "Units", href: "/accounting/production/inventory/units", icon: Ruler },
]

export const productionReportItems: ProductionMenuItem[] = [
  { label: "Category Reports", href: "/accounting/production/reports/category", icon: FolderTree },
  { label: "Stock Reports", href: "/accounting/production/reports/stock", icon: Package },
]

export function ProductionMenuList({ items }: { items: ProductionMenuItem[] }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map(item => {
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
  )
}
