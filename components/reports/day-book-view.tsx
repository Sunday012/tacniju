"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"

export function DayBookView({ data, onBack }: { data: any[], onBack: () => void }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const targetDate = searchParams.get("date") || new Date().toISOString().slice(0, 10)

    function handleDateSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const date = formData.get("date") as string
        if (date) {
            router.push(`/accounting?date=${date}`)
        }
    }

    return (
        <div className="p-4 md:p-8 overflow-y-auto h-full space-y-6 bg-slate-50 relative z-20">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Day Book</h1>
                    <p className="text-slate-500">Chronological record of daily transactions.</p>
                </div>
                <button onClick={onBack} className="text-sm bg-slate-200 hover:bg-slate-300 px-3 py-1.5 rounded transition font-medium">Esc: Back</button>
            </div>

            <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Transactions for {new Date(targetDate).toLocaleDateString()}</CardTitle>
                            <CardDescription>All vouchers entered on this day.</CardDescription>
                        </div>
                        <form onSubmit={handleDateSubmit} className="flex gap-2">
                            <input
                                type="date"
                                name="date"
                                defaultValue={targetDate}
                                className="bg-slate-50 border border-slate-300 rounded px-3 py-1 text-sm text-slate-900"
                            />
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
                                data.map(v => (
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
                                                {v.voucher_entries?.map((e: any, i: number) => (
                                                    <div key={i} className={`flex justify-between ${e.debit_amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        <span>{e.debit_amount > 0 ? 'Dr' : 'Cr'} {e.ledgers?.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            <div className="mt-8">
                                                {v.voucher_entries?.find((e: any) => e.debit_amount > 0)?.debit_amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            <div className="mt-8">
                                                {v.voucher_entries?.find((e: any) => e.credit_amount > 0)?.credit_amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '-'}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
