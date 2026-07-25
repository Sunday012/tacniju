"use client"

import { Fragment, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"

export function TrialBalanceView({ data, onBack }: { data: any[], onBack: () => void }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [openRows, setOpenRows] = useState<Record<string, boolean>>({})

    let totalDr = 0
    let totalCr = 0

    data.forEach(row => {
        totalDr += row.closingDr
        totalCr += row.closingCr
    })

    function handleDateSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const start = formData.get("start") as string
        const end = formData.get("end") as string
        const params = new URLSearchParams()
        if (start) params.set("start", start)
        if (end) params.set("end", end)
        router.push(`/accounting?${params.toString()}`)
    }

    return (
        <div className="p-4 md:p-8 overflow-y-auto h-full space-y-6 bg-slate-50 relative z-20">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Trial Balance</h1>
                    <p className="text-slate-500">Statement of all ledger balances to verify mathematical accuracy.</p>
                </div>
                <button onClick={onBack} className="text-sm bg-slate-200 hover:bg-slate-300 px-3 py-1.5 rounded transition font-medium">Esc: Back</button>
            </div>

            <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl">Account Balances</CardTitle>
                            <CardDescription>
                                As of {searchParams.get("end") ? new Date(searchParams.get("end")!).toLocaleDateString() : 'Today'}
                            </CardDescription>
                        </div>
                        <form onSubmit={handleDateSubmit} className="flex gap-2 items-center">
                            <span className="text-xs text-slate-500 font-medium">From:</span>
                            <input
                                type="date"
                                name="start"
                                defaultValue={searchParams.get("start") || ""}
                                className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm text-slate-900 w-32"
                            />
                            <span className="text-xs text-slate-500 font-medium">To:</span>
                            <input
                                type="date"
                                name="end"
                                defaultValue={searchParams.get("end") || ""}
                                className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm text-slate-900 w-32"
                            />
                            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500">Go</Button>
                        </form>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-200">
                                <TableHead className="text-slate-500">Particulars</TableHead>
                                <TableHead className="text-slate-500 text-right">Debit Balance (₦)</TableHead>
                                <TableHead className="text-slate-500 text-right">Credit Balance (₦)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-slate-500 py-6">No data found.</TableCell>
                                </TableRow>
                            ) : (
                                data.map((row, idx) => {
                                    const rowKey = row.groupName || row.ledgerName || String(idx)
                                    const isOpen = openRows[rowKey]
                                    const children = row.children || []
                                    return (
                                        <Fragment key={rowKey}>
                                            <TableRow key={rowKey} className="border-slate-200 hover:bg-slate-50">
                                                <TableCell className="font-bold text-slate-800">
                                                    {children.length > 1 ? (
                                                        <button type="button" onClick={() => setOpenRows(current => ({ ...current, [rowKey]: !isOpen }))} className="text-left hover:text-indigo-700 hover:underline">
                                                            {isOpen ? "[-]" : "[+]"} {row.ledgerName}
                                                        </button>
                                                    ) : row.ledgerName}
                                                </TableCell>
                                                <TableCell className="text-right text-red-600 font-mono">
                                                    {row.closingDr > 0 ? row.closingDr.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                                </TableCell>
                                                <TableCell className="text-right text-emerald-600 font-mono">
                                                    {row.closingCr > 0 ? row.closingCr.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                                </TableCell>
                                            </TableRow>
                                            {isOpen && children.map((child: any) => (
                                                <TableRow key={`${rowKey}-${child.ledgerName}`} className="border-slate-100 bg-slate-50/60">
                                                    <TableCell className="pl-8 text-sm font-medium text-slate-600">{child.ledgerName}</TableCell>
                                                    <TableCell className="text-right text-red-600 font-mono text-sm">
                                                        {child.closingDr > 0 ? child.closingDr.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right text-emerald-600 font-mono text-sm">
                                                        {child.closingCr > 0 ? child.closingCr.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </Fragment>
                                    )
                                })
                            )}
                            <TableRow className="border-t-2 border-slate-300 bg-slate-50">
                                <TableCell className="text-right font-bold text-slate-800 uppercase tracking-widest text-sm py-4">
                                    Total
                                </TableCell>
                                <TableCell className="text-right font-bold text-red-600 font-mono text-lg py-4">
                                    {totalDr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="text-right font-bold text-emerald-600 font-mono text-lg py-4">
                                    {totalCr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
