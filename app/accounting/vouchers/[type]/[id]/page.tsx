import { notFound } from "next/navigation"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getVoucherById, VoucherType } from "@/app/vouchers/actions"
import { getAccountingPrograms } from "@/app/accounting/actions"
import Link from "next/link"

const typeMap: Record<string, VoucherType> = {
  payment: "Payment",
  receipt: "Receipt",
  sales: "Sales",
  purchase: "Purchase",
  expense: "Expense",
  income: "Income",
  contra: "Contra",
  program: "Program",
}

function formatIsoDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-")
  if (!year || !month || !day) return dateValue
  return `${day}/${month}/${year}`
}

export default async function AccountingVoucherDetailPage({
  params,
  searchParams,
}: {
  params: { type: string; id: string }
  searchParams?: { from?: string }
}) {
  const voucherType = typeMap[params.type]
  if (!voucherType) notFound()

  const [voucher, programs] = await Promise.all([
    getVoucherById(params.id),
    getAccountingPrograms(),
  ])
  if (!voucher || voucher.voucher_type !== voucherType) notFound()
  const linkedProgram = programs.find(program => program.id === voucher.reference)
  const referenceLabel = linkedProgram?.name || voucher.reference || "-"

  const totalDebit = (voucher.voucher_entries || []).reduce(
    (sum: number, entry: any) => sum + Number(entry.debit_amount || 0),
    0
  )
  const totalCredit = (voucher.voucher_entries || []).reduce(
    (sum: number, entry: any) => sum + Number(entry.credit_amount || 0),
    0
  )
  const registerBack: Record<string, { href: string; label: string }> = {
    daybook: { href: "/accounting/day-book", label: "Day Book" },
    "income-register": { href: "/accounting/display/income-register", label: "Income Register" },
    "expense-register": { href: "/accounting/display/expense-purchase-register", label: "Expenses Purchase Register" },
    "payment-receipt-register": { href: "/accounting/display/payment-receipt-register", label: "Payment / Receipt Register" },
    "sales-register": { href: "/accounting/display/sales-register", label: "Sales Register" },
    "purchase-register": { href: "/accounting/display/purchase-register", label: "Purchase Register" },
  }
  const backFrom = searchParams?.from ? registerBack[searchParams.from] : undefined
  const backHref = backFrom?.href || `/accounting/vouchers/${params.type}`
  const backLabel = backFrom?.label || `${voucherType} Vouchers`

  return (
    <AccountingShell
      title={`${voucherType} ${voucher.voucher_no}`}
      framed={false}
      backHref={backHref}
      backLabel={backLabel}
      hero={{
        title: voucher.narration || voucher.voucher_no,
        subtitle: `${voucherType} Voucher`,
        badge: voucher.voucher_no,
        compact: true,
      }}
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Link
            href={`/accounting/vouchers/${params.type}?edit=${voucher.id}`}
            className="inline-flex h-10 items-center rounded-xl bg-indigo-600 px-4 text-sm font-black text-white shadow-sm hover:bg-indigo-700"
          >
            Edit Voucher
          </Link>
        </div>

        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Voucher Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Voucher No.</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{voucher.voucher_no}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Date</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{formatIsoDate(voucher.date)}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Debit</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">₦{totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Credit</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">₦{totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Narration</p>
              <p className="mt-2 text-base text-slate-700">{voucher.narration || "-"}</p>
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Program</p>
              <p className="mt-2 text-base text-slate-700">{referenceLabel}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Ledger Entries</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50 [&_th]:px-5 [&_th]:py-3.5 [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-600">
                <TableRow>
                  <TableHead>Ledger</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 [&_td]:px-5 [&_td]:py-3.5">
                {(voucher.voucher_entries || []).map((entry: any) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium text-slate-800">{entry.ledgers?.name || "Ledger"}</TableCell>
                    <TableCell className="text-right text-slate-700">
                      {Number(entry.debit_amount || 0) > 0
                        ? Number(entry.debit_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right text-slate-700">
                      {Number(entry.credit_amount || 0) > 0
                        ? Number(entry.credit_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {(voucher.voucher_items || []).length > 0 ? (
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50 [&_th]:px-5 [&_th]:py-3.5 [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-600">
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Movement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100 [&_td]:px-5 [&_td]:py-3.5">
                  {(voucher.voucher_items || []).map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-slate-800">{item.items?.name || "Item"}</TableCell>
                      <TableCell className="text-right text-slate-700">{Number(item.qty || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-slate-700">{Number(item.rate || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right text-slate-700">{Number(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-slate-700">{item.movement_type || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AccountingShell>
  )
}
