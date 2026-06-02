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
        subtitle: "Create and track stock items, quantities, cost and selling prices for this assembly.",
        badge: "Stock",
      }}
    >
      <ItemManager items={items} hideTitle />
    </AccountingShell>
  )
}
