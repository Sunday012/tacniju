import { Boxes, ChefHat, ClipboardList, FileBarChart, FolderTree, Package, ReceiptText, Ruler, ScrollText } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { AccountingMenuList } from "@/components/accounting/accounting-menu-list"

type ProductionMenuItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const productionMenuItems: ProductionMenuItem[] = [
  { label: "Stock Journal", href: "/accounting/production/stock-journal", icon: ClipboardList },
  { label: "Raw Material Journal", href: "/accounting/production/raw-material-journal", icon: ScrollText },
  { label: "Kitchen", href: "/accounting/production/kitchen", icon: ChefHat },
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
  return <AccountingMenuList items={items} />
}
