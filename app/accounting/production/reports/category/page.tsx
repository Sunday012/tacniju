import { AccountingShell } from "@/components/accounting/accounting-shell"
import { getItems } from "@/app/inventory/actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ReportSheet } from "@/components/reports/report-sheet"

export default async function ProductionCategoryReportsPage() {
  const items = await getItems()
  const groups = Array.from(
    items.reduce((map, item) => {
      const category = item.category || "Uncategorized"
      const existing = map.get(category) || []
      existing.push(item)
      map.set(category, existing)
      return map
    }, new Map<string, typeof items>())
  ).sort(([a], [b]) => a.localeCompare(b))

  return (
    <AccountingShell title="Category Reports" backHref="/accounting/production/reports" backLabel="Production Reports" showTitle={false}>
      <ReportSheet title="Category Reports" subtitle="Stock grouped by inventory category">
              <Table>
                <TableHeader className="bg-slate-50 [&_th]:px-5 [&_th]:py-3.5 [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-600">
                  <TableRow className="border-slate-200">
                    <TableHead className="text-slate-500">Item</TableHead>
                    <TableHead className="text-slate-500">Unit</TableHead>
                    <TableHead className="text-right text-slate-500">Opening Qty</TableHead>
                    <TableHead className="text-right text-slate-500">Current Qty</TableHead>
                    <TableHead className="text-right text-slate-500">Reorder Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="[&_td]:px-5 [&_td]:py-3.5">
                  {groups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-6 text-center text-slate-500">
                        No category report records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    groups.map(([category, categoryItems]) => (
                      <CategoryRows key={category} category={category} items={categoryItems} />
                    ))
                  )}
                </TableBody>
              </Table>
      </ReportSheet>
    </AccountingShell>
  )
}

function CategoryRows({ category, items }: { category: string; items: Awaited<ReturnType<typeof getItems>> }) {
  const openingTotal = items.reduce((total, item) => total + Number(item.opening_qty || 0), 0)
  const currentTotal = items.reduce((total, item) => total + Number(item.current_stock || 0), 0)

  return (
    <>
      <TableRow className="border-slate-200 bg-slate-50">
        <TableCell colSpan={5} className="py-2 text-xs font-black uppercase tracking-widest text-slate-500">
          {category} ({items.length}) · Opening {openingTotal.toLocaleString()} · Current {currentTotal.toLocaleString()}
        </TableCell>
      </TableRow>
      {items.map(item => (
        <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50">
          <TableCell className="font-medium text-slate-800">
            {item.name}
            {item.code && <span className="ml-2 font-mono text-xs text-slate-400">{item.code}</span>}
          </TableCell>
          <TableCell className="text-slate-500">{item.primary_unit || item.unit || "-"}</TableCell>
          <TableCell className="text-right font-mono text-slate-700">{Number(item.opening_qty || 0).toLocaleString()}</TableCell>
          <TableCell className="text-right font-mono text-slate-700">{Number(item.current_stock || 0).toLocaleString()}</TableCell>
          <TableCell className="text-right font-mono text-slate-700">{Number(item.reorder_level || 0).toLocaleString()}</TableCell>
        </TableRow>
      ))}
    </>
  )
}
