import Link from "next/link"
import { notFound } from "next/navigation"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAccountingProgramWithVouchers } from "@/app/accounting/actions"

function formatIsoDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-")
  if (!year || !month || !day) return dateValue
  return `${day}/${month}/${year}`
}

function getVoucherHref(voucherType: string, voucherId: string) {
  return `/accounting/vouchers/${voucherType.toLowerCase()}/${voucherId}`
}

export default async function AccountingProgramDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const data = await getAccountingProgramWithVouchers(params.id)
  if (!data) notFound()

  const totalAmount = data.vouchers.reduce((sum, voucher) => sum + voucher.total_amount, 0)

  return (
    <AccountingShell
      title={data.program.name}
      framed={false}
      backHref="/accounting/programs"
      backLabel="Programs"
      hero={{
        title: data.program.name,
        subtitle: "Program Voucher Register",
        badge: `${data.vouchers.length.toLocaleString()} vouchers`,
        compact: true,
      }}
    >
      <div className="space-y-6">
        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Program Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Amount To Contribute</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                ₦{Number(data.program.amount_to_contribute || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Recorded Total</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                ₦{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Voucher Count</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{data.vouchers.length.toLocaleString()}</p>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Other Info</p>
              <p className="mt-2 text-base text-slate-700">{data.program.description || "-"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Recorded Vouchers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50 [&_th]:px-5 [&_th]:py-3.5 [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-600">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Voucher</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Narration</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 [&_td]:px-5 [&_td]:py-3.5">
                {data.vouchers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-slate-500">
                      No vouchers have been recorded under this program yet.
                    </TableCell>
                  </TableRow>
                ) : data.vouchers.map(voucher => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-medium text-slate-700">{formatIsoDate(voucher.date)}</TableCell>
                    <TableCell>
                      <Link href={getVoucherHref(voucher.voucher_type, voucher.id)} className="font-bold text-indigo-700 hover:underline">
                        {voucher.voucher_no || "Open voucher"}
                      </Link>
                    </TableCell>
                    <TableCell className="text-slate-700">{voucher.voucher_type}</TableCell>
                    <TableCell className="max-w-md truncate text-slate-600">{voucher.narration || "-"}</TableCell>
                    <TableCell className="text-right font-mono text-slate-800">
                      ₦{voucher.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AccountingShell>
  )
}
