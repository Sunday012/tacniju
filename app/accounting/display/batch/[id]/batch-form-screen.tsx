import { notFound } from "next/navigation"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { getItems } from "@/app/inventory/actions"
import { getBatch } from "../actions"
import { BatchForm, DeleteBatchForm, SubmitButton } from "./batch-form"
import { BatchRows } from "./batch-rows"

export async function BatchFormScreen({
  params,
  returnTo = "",
  backHref = "/accounting/display/batch",
  backLabel = "Batch Register",
  mode = "batch",
}: {
  params: { id: string }
  returnTo?: string
  backHref?: string
  backLabel?: string
  mode?: "batch" | "takeaway"
}) {
  const [items, batch] = await Promise.all([
    getItems(),
    getBatch(params.id),
  ])

  if (params.id !== "new" && !batch) notFound()

  const rows = Array.from({ length: 10 }).map((_, index) => {
    const item = batch?.voucher_items?.[index] as any
    return {
      itemName: item?.items?.name || "",
      qty: item?.qty ? Number(item.qty) : "",
    }
  })

  const entryName = mode === "takeaway" ? "Takeaway" : "Batch"

  return (
    <AccountingShell
      title={params.id === "new" ? `New ${entryName}` : String(batch?.reference || entryName)}
      backHref={backHref}
      backLabel={backLabel}
      framed={false}
    >
      <BatchForm>
        {returnTo ? <input type="hidden" name="return_to" value={returnTo} /> : null}
        <input type="hidden" name="batch_mode" value={mode} />
        <input type="hidden" name="batch_id" value={params.id === "new" ? "" : params.id} />

        <div className="border-b border-slate-300 bg-slate-50 px-4 py-3">
          <label className="block max-w-xs">
            <span className="mb-1 block text-xs font-black uppercase tracking-widest text-slate-500">{entryName} No</span>
            <input
              name="batch_no"
              defaultValue={batch?.reference || `${entryName} ${Date.now().toString().slice(-3)}`}
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-400"
            />
          </label>
        </div>

        <div className="grid border-b border-slate-300 bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-600 md:grid-cols-[1fr_140px]">
          <div className="border-b border-slate-300 px-3 py-2 md:border-b-0 md:border-r">List of Items</div>
          <div className="px-3 py-2 text-right">Qty</div>
        </div>

        <BatchRows rows={rows} />

        <datalist id="batch-items">
          {items.map(item => <option key={item.id} value={item.name} />)}
        </datalist>

        <div className="grid gap-3 border-t border-slate-300 bg-slate-50 p-3 md:grid-cols-[1fr_auto]">
          <label>
            <span className="mb-1 block text-xs font-black uppercase tracking-widest text-slate-500">Narration</span>
            <textarea
              name="narration"
              defaultValue={batch?.narration === "Batch" ? "" : batch?.narration || ""}
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-400"
            />
          </label>
          <div />
        </div>
      </BatchForm>

      <div className="mt-4 flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
        {params.id !== "new" && <DeleteBatchForm batchId={params.id} returnTo={returnTo} />}
        <SubmitButton form="batch-form" />
      </div>
    </AccountingShell>
  )
}
