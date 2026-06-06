import { AccountingShell } from "@/components/accounting/accounting-shell"
import { ItemManager } from "@/components/inventory/item-manager"
import { getItems } from "@/app/inventory/actions"

export default async function ProductionItemsPage() {
  const items = await getItems()

  return (
    <AccountingShell title="Production Items" framed={false} backHref="/accounting/production/inventory" backLabel="Production Inventory">
      <ItemManager items={items} hideTitle />
    </AccountingShell>
  )
}
