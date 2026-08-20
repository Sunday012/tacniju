import { AccountingShell } from "@/components/accounting/accounting-shell"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getBillPendingRows } from "../bill-pending/actions"

function money(value: number) {
  return value ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"
}

export default async function OutstandingPayablePage() {
  const [purchase, expense] = await Promise.all([getBillPendingRows("purchase"), getBillPendingRows("expense")])
  const rows = Array.from([...purchase, ...expense].reduce((map, row) => {
    const current = map.get(row.party) || { party: row.party, vouchers: 0, amount: 0 }
    current.vouchers += 1
    current.amount += row.pendingValue
    map.set(row.party, current)
    return map
  }, new Map<string, { party: string; vouchers: number; amount: number }>()).values())
    .sort((a, b) => b.amount - a.amount || a.party.localeCompare(b.party))
  const total = rows.reduce((sum, row) => sum + row.amount, 0)

  return (
    <AccountingShell title="Outstanding Payables" backHref="/accounting/display/statement-of-accounts" backLabel="Statement of Accounts">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Party</TableHead>
            <TableHead className="text-right">Open Vouchers</TableHead>
            <TableHead className="text-right">Amount We Owe</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow><TableCell colSpan={3} className="py-8 text-center text-slate-500">No outstanding payables.</TableCell></TableRow>
          ) : rows.map(row => (
            <TableRow key={row.party}>
              <TableCell className="font-bold">{row.party}</TableCell>
              <TableCell className="text-right font-mono">{row.vouchers.toLocaleString()}</TableCell>
              <TableCell className="text-right font-mono font-bold">{money(row.amount)}</TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-slate-50">
            <TableCell colSpan={2} className="text-right font-black">Total</TableCell>
            <TableCell className="text-right font-mono font-black">{money(total)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </AccountingShell>
  )
}
