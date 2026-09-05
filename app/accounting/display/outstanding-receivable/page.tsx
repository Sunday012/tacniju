import Link from "next/link"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getBillPendingRows } from "../bill-pending/actions"

function money(value: number) {
  return value ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"
}

export default async function OutstandingReceivablePage() {
  const [sales, income] = await Promise.all([getBillPendingRows("sales"), getBillPendingRows("income")])
  const rows = Array.from([...sales, ...income].reduce((map, row) => {
    const key = row.partyId || row.party
    const current = map.get(key) || { party: row.party, partyId: row.partyId, vouchers: 0, amount: 0 }
    current.vouchers += 1
    current.amount += row.pendingValue
    map.set(key, current)
    return map
  }, new Map<string, { party: string; partyId: string | null; vouchers: number; amount: number }>()).values())
    .sort((a, b) => b.amount - a.amount || a.party.localeCompare(b.party))
  const total = rows.reduce((sum, row) => sum + row.amount, 0)

  return (
    <AccountingShell title="Outstanding Receivables" backHref="/accounting/display/statement-of-accounts" backLabel="Statement of Accounts">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Party</TableHead>
            <TableHead className="text-right">Open Vouchers</TableHead>
            <TableHead className="text-right">Amount Owed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow><TableCell colSpan={3} className="py-8 text-center text-slate-500">No outstanding receivables.</TableCell></TableRow>
          ) : rows.map(row => (
            <TableRow key={row.partyId || row.party} className="hover:bg-slate-50">
              <TableCell className="font-bold">
                {row.partyId ? (
                  <Link href={`/accounting/info/party/${row.partyId}`} className="block hover:text-indigo-700">
                    {row.party}
                  </Link>
                ) : row.party}
              </TableCell>
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
