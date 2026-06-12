import { AccountingShell } from "@/components/accounting/accounting-shell"
import { getProductionJournalSummaries } from "../actions"

export default async function JournalSummaryPage() {
  const rows = await getProductionJournalSummaries()
  const rawMaterialRows = rows.filter(row => row.journalType === "Raw Material")
  const stockJournalRows = rows.filter(row => row.journalType === "Production")

  return (
    <AccountingShell title="Journal Summary" backHref="/accounting/production" backLabel="Production" showTitle={false}>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center font-medium text-slate-500">
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
