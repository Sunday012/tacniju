import Link from "next/link"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { getStockJournalDiaryRows, StockJournalDiaryRow } from "@/app/accounting/production/actions"

function formatDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-")
  if (!year || !month || !day) return dateValue || "-"
  return `${day}/${month}/${year}`
}

export async function StockJournalDiary({
  title = "Stock Journal",
  backHref,
  backLabel,
  movementType,
}: {
  title?: string
  backHref: string
  backLabel: string
  movementType?: "IN" | "OUT"
}) {
  const rows = await getStockJournalDiaryRows({ movementType })
  const groupedRows = rows.reduce((groups, row) => {
    const group = groups.get(row.itemId) || []
    group.push(row)
    groups.set(row.itemId, group)
    return groups
  }, new Map<string, StockJournalDiaryRow[]>())

  return (
    <AccountingShell title={title} backHref={backHref} backLabel={backLabel}>
      <div className="space-y-4">
        {groupedRows.size === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm font-semibold text-slate-500">
            No stock movement has been recorded yet.
          </div>
        ) : Array.from(groupedRows.entries()).map(([itemId, itemRows]) => (
          <section key={itemId} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h2 className="text-base font-black text-slate-900">{itemRows[0]?.itemName || "Stock Item"}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-xs uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Voucher</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Narration</th>
                    <th className="px-4 py-3 text-right">In</th>
                    <th className="px-4 py-3 text-right">Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {itemRows.map((row, index) => (
                    <tr key={`${row.voucherId}-${row.movementType}-${row.qty}-${index}`} className="font-semibold text-slate-700 hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(row.date)}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-black text-slate-900">
                        <Link href={`/accounting/vouchers/purchase/${row.voucherId}`} className="hover:text-indigo-700">
                          {row.voucherNo}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{row.reference || "-"}</td>
                      <td className="px-4 py-3">{row.narration}</td>
                      <td className="px-4 py-3 text-right font-mono font-black text-emerald-600">
                        {row.movementType === "IN" ? row.qty.toLocaleString() : "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-black text-red-600">
                        {row.movementType === "OUT" ? row.qty.toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </AccountingShell>
  )
}
