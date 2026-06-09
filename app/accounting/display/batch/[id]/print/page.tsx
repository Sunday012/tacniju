import { notFound } from "next/navigation"
import { getBatch } from "../../actions"
import { PrintButton } from "@/components/print-button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default async function PrintBatchPage({ params }: { params: { id: string } }) {
  const batch = await getBatch(params.id)
  
  if (!batch) notFound()

  const items = batch.voucher_items || []
  const totalQty = items.reduce((sum: number, item: any) => sum + Number(item.qty || 0), 0)

  return (
    <div className="min-h-screen bg-slate-50 py-8 print:bg-white print:py-0">
      <div className="mx-auto max-w-3xl px-4 print:max-w-none print:px-0">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link
            href="/accounting/display/batch"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Batches
          </Link>
          <PrintButton />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm print:border-none print:p-0 print:shadow-none">
          <div className="mb-8 border-b border-slate-200 pb-6 text-center">
            <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">Batch details</h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">{batch.reference || batch.voucher_no}</p>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-bold text-slate-500 uppercase text-xs tracking-wider mb-1">Voucher No.</p>
              <p className="font-semibold text-slate-900">{batch.voucher_no}</p>
            </div>
            {batch.narration && batch.narration !== "Batch" && (
              <div className="text-right">
                <p className="font-bold text-slate-500 uppercase text-xs tracking-wider mb-1">Narration</p>
                <p className="font-semibold text-slate-900">{batch.narration}</p>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-4 py-3 border-b border-slate-200">Item Name</th>
                  <th className="px-4 py-3 border-b border-slate-200 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {items.map((item: any) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">{item.items?.name || "Unknown Item"}</td>
                    <td className="px-4 py-3 text-right">{Number(item.qty).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-black text-slate-900">
                <tr>
                  <td className="px-4 py-3 text-right uppercase tracking-widest text-xs text-slate-500">Total Qty</td>
                  <td className="px-4 py-3 text-right text-base">{totalQty.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
