import Link from "next/link"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getBillPendingRows } from "../bill-pending/actions"

function money(value: number) {
  return value ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"
}

export default async function OutstandingReceivablePage() {
  const [sales, income] = await Promise.all([getBillPendingRows("sales"), getBillPendingRows("income")])
  const rows = [...sales, ...income]
  const total = rows.reduce((sum, row) => sum + row.pendingValue, 0)

  return (
    <AccountingShell title="Outstanding Receivables" backHref="/accounting/display/statement-of-accounts" backLabel="Statement of Accounts">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Party</TableHead>
            <TableHead>Voucher</TableHead>
            <TableHead className="text-right">Amount Owed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow><TableCell colSpan={3} className="py-8 text-center text-slate-500">No outstanding receivables.</TableCell></TableRow>
          ) : rows.map(row => (
            <TableRow key={row.id}>
              <TableCell className="font-bold">{row.party}</TableCell>
              <TableCell><Link href={`/accounting/vouchers/${row.voucherType.toLowerCase()}/${row.id}`} className="hover:text-indigo-700 hover:underline">{row.voucherNo}</Link></TableCell>
              <TableCell className="text-right font-mono font-bold">{money(row.pendingValue)}</TableCell>
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
