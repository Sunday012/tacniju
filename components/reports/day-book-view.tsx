"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"

const voucherOrder = ["Receipt", "Payment", "Sales", "Purchase", "Expense", "Income", "Program", "Contra"]

export function DayBookView({ data, onBack }: { data: any[], onBack?: () => void }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const targetDate = searchParams.get("date") || new Date().toISOString().slice(0, 10)

    function getEntryTotals(entries: any[] = []) {
        return entries.reduce(
            (totals, entry) => ({
                debit: totals.debit + Number(entry.debit_amount || 0),
                credit: totals.credit + Number(entry.credit_amount || 0),
            }),
            { debit: 0, credit: 0 }
        )
    }

    function handleDateSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const date = formData.get("date") as string
        if (date) {
            router.push(`/accounting/day-book?date=${date}`)
        }
    }

    const sortedData = [...data].sort((a, b) => {
        const typeDiff = voucherOrder.indexOf(a.voucher_type) - voucherOrder.indexOf(b.voucher_type)
        if (typeDiff !== 0) return typeDiff
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })

    const totals = sortedData.reduce((acc, voucher) => {
        const entryTotals = getEntryTotals(voucher.voucher_entries || [])
        if (voucher.voucher_type === "Receipt") acc.receipts += entryTotals.debit || entryTotals.credit
        if (voucher.voucher_type === "Payment") acc.payments += entryTotals.credit || entryTotals.debit
        if (voucher.voucher_type === "Sales") acc.sales += Math.max(entryTotals.debit, entryTotals.credit)
        if (voucher.voucher_type === "Purchase") acc.purchases += Math.max(entryTotals.debit, entryTotals.credit)
        if (voucher.voucher_type === "Expense") acc.expenses += Math.max(entryTotals.debit, entryTotals.credit)
        return acc
    }, { receipts: 0, payments: 0, sales: 0, purchases: 0, expenses: 0 })

    return (
        <div className="space-y-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <form onSubmit={handleDateSubmit} className="flex max-w-sm gap-2">
                <input
                    type="date"
                    name="date"
                    defaultValue={targetDate}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none"
                />
                <Button type="submit" className="h-11 bg-indigo-600 px-6 font-bold text-white hover:bg-indigo-700">Go</Button>
              </form>
              {onBack && <button onClick={onBack} className="h-10 rounded-xl bg-slate-100 px-4 text-sm font-bold text-slate-700 hover:bg-slate-200">Back</button>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[
                    ["Total Receipts", totals.receipts],
                    ["Total Payments", totals.payments],
                    ["Total Sales", totals.sales],
                    ["Total Purchases", totals.purchases],
                    ["Total Expenses", totals.expenses],
                ].map(([label, value]) => (
                    <div key={label as string} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
                        <p className="mt-2 text-2xl font-black text-slate-900">₦{Number(value).toLocaleString()}</p>
                    </div>
                ))}
            </div>

            <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Transactions for {new Date(targetDate).toLocaleDateString()}</CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-200">
                                <TableHead className="text-slate-500">Date/Time</TableHead>
                                <TableHead className="text-slate-500">Vch Type</TableHead>
                                <TableHead className="text-slate-500">Vch No.</TableHead>
                                <TableHead className="text-slate-500">Particulars (Dr/Cr)</TableHead>
                                <TableHead className="text-slate-500 text-right">Debit (₦)</TableHead>
                                <TableHead className="text-slate-500 text-right">Credit (₦)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-slate-500 py-6">No transactions recorded on this date.</TableCell>
                                </TableRow>
                            ) : (
                                sortedData.map(v => {
                                    const entries = v.voucher_entries || []
                                    const totals = getEntryTotals(entries)

                                    return (
                                    <TableRow key={v.id} className="border-slate-200 align-top hover:bg-slate-50">
                                        <TableCell className="text-slate-500 whitespace-nowrap">
                                            {new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold ${v.voucher_type === 'Payment' ? 'bg-red-100 text-red-600' :
                                                v.voucher_type === 'Receipt' ? 'bg-emerald-100 text-emerald-600' :
                                                    v.voucher_type === 'Contra' ? 'bg-blue-100 text-blue-600' :
                                                        'bg-amber-100 text-amber-600'
                                                }`}>
                                                {v.voucher_type}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-bold text-slate-700 text-xs">{v.voucher_no}</TableCell>
                                        <TableCell>
                                            <div className="font-medium text-slate-800 mb-2 italic">"{v.narration}"</div>
                                            <div className="space-y-1">
                                                {entries.length === 0 ? (
                                                    <div className="text-xs text-red-600">No ledger entries were saved for this voucher.</div>
                                                ) : entries.map((e: any, i: number) => (
                                                    <div key={i} className={`flex justify-between ${e.debit_amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        <span>{e.debit_amount > 0 ? 'Dr' : 'Cr'} {e.ledgers?.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            <div className="mt-8">
                                                {totals.debit > 0 ? totals.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            <div className="mt-8">
                                                {totals.credit > 0 ? totals.credit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
