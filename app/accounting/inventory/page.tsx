import { AccountingShell } from "@/components/accounting/accounting-shell"
import { ItemManager } from "@/components/inventory/item-manager"
import { getItems } from "@/app/inventory/actions"

export default async function AccountingInventoryPage() {
  const items = await getItems()

  return (
    <AccountingShell
      title="Inventory Management"
      framed={false}
      hero={{
        eyebrow: "Accounting Inventory",
        title: "Inventory Management",
        badge: "Stock",
      }}
    >
      <ItemManager items={items} hideTitle />
    </AccountingShell>
  )
}
