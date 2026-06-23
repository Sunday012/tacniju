import { getDayBook } from "@/app/reports/actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DayBookPage({ searchParams }: { searchParams: { date?: string; start?: string; end?: string } }) {
    const today = new Date().toISOString().slice(0, 10)
    const hasPeriodFilter = Boolean(searchParams.start || searchParams.end)
    const selectedDate = hasPeriodFilter ? "" : searchParams.date || today
    const startDate = searchParams.start || ""
    const endDate = searchParams.end || ""
    const data = hasPeriodFilter
        ? await getDayBook({ startDate: startDate || undefined, endDate: endDate || undefined })
        : await getDayBook({ date: selectedDate })

    function getEntryTotals(entries: any[] = []) {
        return entries.reduce(
            (totals, entry) => ({
                debit: totals.debit + Number(entry.debit_amount || 0),
                credit: totals.credit + Number(entry.credit_amount || 0),
            }),
            { debit: 0, credit: 0 }
        )
    }

    function getDisplayEntries(voucherType: string, entries: any[] = []) {
        if (voucherType !== "Contra") return entries
        const sendingEntries = entries.filter(entry => Number(entry.credit_amount || 0) > 0)
        return sendingEntries.length > 0 ? sendingEntries : entries
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-900">Day Book</h1>
                        <p className="text-slate-500 dark:text-slate-500">Chronological record of daily transactions.</p>
                    </div>
                    <div>
                        <Link href="/reports">
                            <Button variant="outline" className="border-slate-200 text-slate-700">Back to Reports</Button>
                        </Link>
                    </div>
                </div>

                <Card className="bg-white shadow-sm border-slate-200">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl">
                                    {hasPeriodFilter
                                        ? `Transactions for ${startDate || "-"} to ${endDate || "-"}`
                                        : `Transactions for ${selectedDate}`}
                                </CardTitle>
                                <CardDescription>
                                    {hasPeriodFilter ? "All vouchers entered in this period." : "All vouchers entered on this day."}
                                </CardDescription>
                            </div>
                            <form className="flex gap-2" method="get">
                                <input
                                    type="date"
                                    name="date"
                                    defaultValue={selectedDate}
                                    className="bg-slate-50 border border-slate-200 rounded px-3 py-1 text-sm text-slate-900"
                                />
                                <input type="date" name="start" defaultValue={startDate} className="bg-slate-50 border border-slate-200 rounded px-3 py-1 text-sm text-slate-900" />
                                <input type="date" name="end" defaultValue={endDate} className="bg-slate-50 border border-slate-200 rounded px-3 py-1 text-sm text-slate-900" />
                                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500">Go</Button>
                            </form>
                        </div>
                    </CardHeader>
                    <CardContent>
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
                                {data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-slate-500 py-6">No transactions recorded on this date.</TableCell>
                                    </TableRow>
                                ) : (
                                    data.map(v => {
                                        const entries = v.voucher_entries || []
                                        const totals = getEntryTotals(entries)
                                        const displayEntries = getDisplayEntries(v.voucher_type, entries)
                                        const contraTotal = Math.max(totals.debit, totals.credit)

                                        return (
                                        <TableRow key={v.id} className="border-slate-200 align-top">
                                            <TableCell className="text-slate-500 whitespace-nowrap">
                                                {new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold ${v.voucher_type === 'Payment' ? 'bg-red-100 text-red-500' :
                                                        v.voucher_type === 'Receipt' ? 'bg-emerald-100 text-emerald-500' :
                                                            v.voucher_type === 'Contra' ? 'bg-blue-100 text-blue-400' :
                                                                'bg-amber-100 text-amber-500'
                                                    }`}>
                                                    {v.voucher_type}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-bold text-slate-700 text-xs">{v.voucher_no}</TableCell>
                                            <TableCell>
                                                <div className="font-medium text-slate-800 mb-2 italic">"{v.narration}"</div>
                                                <div className="space-y-1">
                                                    {displayEntries.length === 0 ? (
                                                        <div className="text-xs text-red-600">No ledger entries were saved for this voucher.</div>
                                                    ) : displayEntries.map((e: any, i: number) => (
                                                        <div key={i} className={`flex justify-between ${e.debit_amount > 0 ? 'text-emerald-400/80' : 'text-red-400/80'}`}>
                                                            <span>{e.debit_amount > 0 ? 'Dr' : 'Cr'} {e.ledgers?.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                <div className="mt-8">
                                                    {v.voucher_type !== "Contra" && totals.debit > 0 ? totals.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                <div className="mt-8">
                                                    {(v.voucher_type === "Contra" ? contraTotal : totals.credit) > 0
                                                        ? (v.voucher_type === "Contra" ? contraTotal : totals.credit).toLocaleString(undefined, { minimumFractionDigits: 2 })
                                                        : '-'}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
