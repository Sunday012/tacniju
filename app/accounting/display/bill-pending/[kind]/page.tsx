import Link from "next/link"
import { notFound } from "next/navigation"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BillPendingKind, getBillPendingRows } from "../actions"

const reportConfig: Record<BillPendingKind, { title: string; voucherSlug: string }> = {
  sales: { title: "Sales Bill Pending", voucherSlug: "sales" },
  purchase: { title: "Purchase Bill Pending", voucherSlug: "purchase" },
  payment: { title: "Non Allocated Payment", voucherSlug: "payment" },
  expense: { title: "Expense Bill Pending", voucherSlug: "expense" },
}

export function generateStaticParams() {
  return Object.keys(reportConfig).map(kind => ({ kind }))
}

function formatDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-")
  if (!year || !month || !day) return dateValue
  return `${day}/${month}/${year}`
}

function formatNumber(value: number, decimals = 2) {
  if (!value) return "-"
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export default async function BillPendingPage({ params }: { params: { kind: BillPendingKind } }) {
  const config = reportConfig[params.kind]
  if (!config) notFound()

  const rows = await getBillPendingRows(params.kind)
  const isInventoryReport = params.kind === "sales" || params.kind === "purchase"

  return (
    <AccountingShell title={config.title} backHref="/accounting/display/statement-of-inventory" backLabel="Statement of Inventory">
      <Card className="overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-200 px-4 py-3">
          <CardTitle className="text-lg font-black text-slate-900">{config.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 [&_th]:px-3 [&_th]:py-2.5 [&_th]:text-[11px] [&_th]:font-black [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-600">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Tracking Number</TableHead>
                  <TableHead>{isInventoryReport ? "Name of Item" : "Party"}</TableHead>
                  <TableHead>{isInventoryReport ? "Party" : "Reference"}</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 [&_td]:px-3 [&_td]:py-2.5">
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-sm font-semibold text-slate-500">
                      No pending records found.
                    </TableCell>
                  </TableRow>
                ) : rows.map(row => (
                  <TableRow key={row.id} className="hover:bg-slate-50">
                    <TableCell className="whitespace-nowrap text-xs font-semibold text-slate-600">{formatDate(row.date)}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs font-black text-slate-800">
                      <Link href={`/accounting/vouchers/${config.voucherSlug}/${row.id}`} className="hover:text-indigo-700">
                        {row.voucherNo}
                      </Link>
                    </TableCell>
                    <TableCell className="min-w-[220px] text-sm font-bold text-slate-800">
                      {isInventoryReport ? row.itemName : row.party}
                    </TableCell>
                    <TableCell className="min-w-[180px] text-xs font-semibold text-slate-500">
                      {isInventoryReport ? row.party : row.voucherNo}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-slate-800">{formatNumber(row.pendingQty || row.initialQty, 0)}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-slate-700">{formatNumber(row.rate)}</TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-slate-900">{formatNumber(row.pendingValue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AccountingShell>
  )
}
