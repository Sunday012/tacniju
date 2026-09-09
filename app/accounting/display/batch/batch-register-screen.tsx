import { Boxes, Plus } from "lucide-react"
import Link from "next/link"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { AccountingMenuList } from "@/components/accounting/accounting-menu-list"
import { getBatches } from "./actions"

export async function BatchRegisterScreen({
  title = "Batch Register",
  baseHref = "/accounting/display/batch",
  backHref = "/accounting/display/inventory-book",
  backLabel = "Inventory Book",
  mode = "batch",
  createLabel = "New Batch",
  emptyMessage = "No batches yet. Create the first batch to begin.",
}: {
  title?: string
  baseHref?: string
  backHref?: string
  backLabel?: string
  mode?: "batch" | "takeaway"
  createLabel?: string
  emptyMessage?: string
}) {
  const batches = await getBatches(mode)
  const items = batches.map((batch, index) => ({
    href: `${baseHref}/${batch.id}`,
    label: `${batch.batchNo || `Batch ${index + 1}`} (${batch.itemCount} items, ${batch.totalQty.toLocaleString()} qty)`,
    icon: Boxes,
    printHref: `${baseHref}/${batch.id}/print`,
  }))

  return (
    <AccountingShell title={title} backHref={backHref} backLabel={backLabel}>
      <div className="mb-3 flex justify-end">
        <Link
          href={`${baseHref}/new`}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-3 text-sm font-black text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          {createLabel}
        </Link>
      </div>
      {items.length > 0 ? (
        <AccountingMenuList items={items} />
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm font-semibold text-slate-500">
          {emptyMessage}
        </div>
      )}
    </AccountingShell>
  )
}
