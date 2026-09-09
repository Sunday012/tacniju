import { Boxes, ClipboardList, CookingPot, FileBarChart, FolderTree, Package, ReceiptText, Ruler, Truck } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { AccountingMenuList } from "@/components/accounting/accounting-menu-list"

type ProductionMenuItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const productionMenuItems: ProductionMenuItem[] = [
  { label: "Production", href: "/accounting/inventory/production", icon: Boxes },
  { label: "Consumption", href: "/accounting/inventory/consumption", icon: Truck },
]

export const inventoryProductionItems: ProductionMenuItem[] = [
  { label: "Batch Summary", href: "/accounting/inventory/production/batch-summary", icon: Boxes },
  { label: "Inventory", href: "/accounting/inventory/production/inventory", icon: Package },
  { label: "Stock Journal", href: "/accounting/inventory/production/stock-journal", icon: ClipboardList },
  { label: "Journal Summary", href: "/accounting/inventory/production/journal-summary", icon: ReceiptText },
  { label: "Reports", href: "/accounting/inventory/production/reports", icon: FileBarChart },
]

export const inventoryConsumptionItems: ProductionMenuItem[] = [
  { label: "Takeaway Summary", href: "/accounting/inventory/consumption/takeaway-summary", icon: Truck },
  { label: "Kitchen", href: "/accounting/inventory/consumption/kitchen", icon: CookingPot },
  { label: "Inventory", href: "/accounting/inventory/consumption/inventory", icon: Package },
  { label: "Stock Journal", href: "/accounting/inventory/consumption/stock-journal", icon: ClipboardList },
  { label: "Journal Summary", href: "/accounting/inventory/consumption/journal-summary", icon: ReceiptText },
  { label: "Reports", href: "/accounting/inventory/consumption/reports", icon: FileBarChart },
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
