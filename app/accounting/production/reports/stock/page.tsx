import { AccountingShell } from "@/components/accounting/accounting-shell"
import { getItems } from "@/app/inventory/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function ProductionStockReportsPage() {
  const items = await getItems()

  return (
    <AccountingShell title="Stock Reports" backHref="/accounting/production/reports" backLabel="Production Reports" showTitle={false}>
      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Stock Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <Table>
              <TableHeader className="bg-slate-50 [&_th]:px-5 [&_th]:py-3.5 [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-600">
                <TableRow className="border-slate-200">
                  <TableHead className="text-slate-500">Item</TableHead>
                  <TableHead className="text-slate-500">Category</TableHead>
                  <TableHead className="text-right text-slate-500">Opening Qty</TableHead>
                  <TableHead className="text-right text-slate-500">Inward Qty</TableHead>
                  <TableHead className="text-right text-slate-500">Outward Qty</TableHead>
                  <TableHead className="text-right text-slate-500">Closing Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_td]:px-5 [&_td]:py-3.5">
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-6 text-center text-slate-500">
                      No stock report records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map(item => {
                    const opening = Number(item.opening_qty || 0)
                    const closing = Number(item.current_stock || 0)
                    const netMovement = closing - opening
                    const inward = Math.max(netMovement, 0)
                    const outward = Math.max(-netMovement, 0)

                    return (
                      <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50">
                        <TableCell className="font-medium text-slate-800">{item.name}</TableCell>
                        <TableCell className="text-slate-500">{item.category || "-"}</TableCell>
                        <TableCell className="text-right font-mono text-slate-700">{opening.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono text-emerald-700">{inward.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono text-rose-700">{outward.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-slate-800">{closing.toLocaleString()}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AccountingShell>
  )
}
