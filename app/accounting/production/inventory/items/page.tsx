import { AccountingShell } from "@/components/accounting/accounting-shell"
import { ItemManager } from "@/components/inventory/item-manager"
import { getItems } from "@/app/inventory/actions"
import { getProductionCategories, getProductionUnits } from "../../actions"

export default async function ProductionItemsPage() {
  const [items, categories, units] = await Promise.all([
    getItems(),
    getProductionCategories(),
    getProductionUnits(),
  ])

  return (
    <AccountingShell title="Production Items" framed={false} backHref="/accounting/production/inventory" backLabel="Production Inventory">
      <ItemManager
        items={items}
        hideTitle
        categories={categories.rows.map(category => category.name)}
        units={units.rows.map(unit => unit.short_name || unit.name)}
      />
    </AccountingShell>
  )
}
