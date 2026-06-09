import { Boxes, Plus } from "lucide-react"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { AccountingMenuList } from "@/components/accounting/accounting-menu-list"
import { getBatches } from "./actions"
import Link from "next/link"

export default async function BatchPage() {
  const batches = await getBatches()
  const items = batches.map((batch, index) => ({
    href: `/accounting/display/batch/${batch.id}`,
    label: `${batch.batchNo || `Batch ${index + 1}`} (${batch.itemCount} items, ${batch.totalQty.toLocaleString()} qty)`,
    icon: Boxes,
    printHref: `/accounting/display/batch/${batch.id}/print`,
  }))

  return (
    <AccountingShell title="Batch" backHref="/accounting/display/inventory-book" backLabel="Inventory Book">
      <div className="mb-3 flex justify-end">
        <Link
          href="/accounting/display/batch/new"
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-3 text-sm font-black text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          New Batch
        </Link>
      </div>
      {items.length > 0 ? (
        <AccountingMenuList items={items} />
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm font-semibold text-slate-500">
          No batches yet. Create the first batch to begin.
        </div>
      )}
    </AccountingShell>
  )
}
