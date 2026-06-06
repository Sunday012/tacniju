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
    <div className="flex flex-col gap-3 sm:gap-4">
      {items.map(item => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md sm:gap-4 sm:p-5 lg:p-6"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 sm:h-12 sm:w-12">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h2 className="text-base font-bold text-slate-800 sm:text-lg lg:text-xl">{item.label}</h2>
          </Link>
        )
      })}
    </div>
  )
}
