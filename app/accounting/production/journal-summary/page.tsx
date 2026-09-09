import { AccountingShell } from "@/components/accounting/accounting-shell"
import Link from "next/link"
import { Edit3 } from "lucide-react"
import { getProductionJournalSummaries } from "../actions"
import { DeleteProductionJournalButton } from "@/components/accounting/production/DeleteProductionJournalButton"

export async function JournalSummaryScreen({
  backHref = "/accounting/production",
  backLabel = "Production",
}: {
  backHref?: string
  backLabel?: string
}) {
  const rows = await getProductionJournalSummaries()
  const rawMaterialRows = rows.filter(row => row.journalType === "Raw Material")
  const stockJournalRows = rows.filter(row => row.journalType === "Production")

  return (
    <AccountingShell title="Journal Summary" backHref={backHref} backLabel={backLabel} showTitle={false}>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-extrabold text-slate-800">Journal Summary</h2>
        <JournalSummaryTable
          title="Raw Material Journal"
          rows={rawMaterialRows}
          emptyMessage="No raw material journals have been summarized yet."
        />
        <JournalSummaryTable
          title="Stock Journal"
          rows={stockJournalRows}
          emptyMessage="No stock journals have been summarized yet."
        />
      </div>
    </AccountingShell>
  )
}

function JournalSummaryTable({
  title,
  rows,
  emptyMessage,
}: {
  title: string
  rows: Awaited<ReturnType<typeof getProductionJournalSummaries>>
  emptyMessage: string
}) {
  return (
    <section className="mb-6 last:mb-0">
      <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-slate-500">{title}</h3>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
            <tr>
              <th className="px-5 py-3">Voucher No.</th>
              <th className="px-5 py-3">Batch No.</th>
              <th className="px-5 py-3">Journal Type</th>
              <th className="px-5 py-3 text-right">Items</th>
              <th className="px-5 py-3 text-right">Total Qty</th>
              <th className="px-5 py-3">Narration</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center font-medium text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : rows.map(row => (
              <tr key={row.id} className="font-medium text-slate-600">
                <td className="px-5 py-4 font-bold text-slate-800">{row.voucherNo}</td>
                <td className="px-5 py-4 font-mono">{row.batchNo}</td>
                <td className="px-5 py-4">{row.journalType}</td>
                <td className="px-5 py-4 text-right font-black text-slate-800">{row.itemCount}</td>
                <td className="px-5 py-4 text-right font-black text-indigo-600">{row.totalQty.toLocaleString()}</td>
                <td className="px-5 py-4">{row.narration}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`${row.journalType === "Raw Material" ? "/accounting/inventory/consumption/kitchen" : "/accounting/production/stock-journal"}?edit=${row.id}`}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 text-xs font-black text-indigo-600 hover:bg-indigo-50"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    <DeleteProductionJournalButton journalId={row.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default async function JournalSummaryPage() {
  return <JournalSummaryScreen />
}
