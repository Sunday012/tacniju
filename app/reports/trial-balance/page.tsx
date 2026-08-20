import { getTrialBalance } from "@/app/reports/actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

function money(value: number) {
    return value > 0 ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"
}

export default async function TrialBalancePage({ searchParams }: { searchParams: { start?: string, end?: string } }) {
    const data = await getTrialBalance(searchParams.start, searchParams.end)

    let totalDr = 0
    let totalCr = 0

    data.forEach(row => {
        totalDr += row.closingDr
        totalCr += row.closingCr
    })

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-900">Trial Balance</h1>
                    <p className="text-slate-500 dark:text-slate-500">Statement of all ledger balances to verify mathematical accuracy.</p>
                </div>

                <Card className="bg-white shadow-sm border-slate-200">
                    <CardHeader className="pb-2">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div>
                                <CardTitle className="text-xl">Account Balances</CardTitle>
                                <CardDescription>
                                    As of {searchParams.end ? new Date(searchParams.end).toLocaleDateString() : 'Today'}
                                </CardDescription>
                            </div>
                            <form className="flex flex-wrap items-center gap-2">
                                <input
                                    type="date"
                                    name="start"
                                    defaultValue={searchParams.start || ""}
                                    className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-900"
                                />
                                <input
                                    type="date"
                                    name="end"
                                    defaultValue={searchParams.end || ""}
                                    className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-900"
                                />
                                <button className="h-9 rounded-lg bg-indigo-700 px-4 text-sm font-black text-white hover:bg-indigo-800">Go</button>
                            </form>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader className="bg-slate-50 [&_th]:px-5 [&_th]:py-3.5 [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-600">
                                <TableRow className="border-slate-200">
                                    <TableHead className="text-slate-500">Particulars</TableHead>
                                    <TableHead className="text-slate-500 text-right">Debit Balance (₦)</TableHead>
                                    <TableHead className="text-slate-500 text-right">Credit Balance (₦)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="[&_td]:px-5 [&_td]:py-3.5 [&_tr:hover]:bg-slate-50/60">
                                {data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-slate-500 py-6">No data found.</TableCell>
                                    </TableRow>
                                ) : (
                                    data.map((row, idx) => {
                                        const children = row.children || []
                                        return (
                                            <TableRow key={idx} className="border-slate-200 align-top">
                                                <TableCell className="font-bold text-slate-800">
                                                    {children.length > 0 ? (
                                                        <details>
                                                            <summary className="cursor-pointer list-none hover:text-indigo-700">
                                                                <span className="mr-2 text-xs text-indigo-600">[+]</span>{row.ledgerName}
                                                            </summary>
                                                            <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
                                                                <div className="grid grid-cols-[1fr_130px_130px] bg-slate-50 px-3 py-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
                                                                    <div>Ledger</div>
                                                                    <div className="text-right">Debit</div>
                                                                    <div className="text-right">Credit</div>
                                                                </div>
                                                                {children.map((child: any) => (
                                                                    <div key={child.ledgerName} className="grid grid-cols-[1fr_130px_130px] border-t border-slate-100 px-3 py-2 text-sm">
                                                                        <div className="font-medium text-slate-600">{child.ledgerName}</div>
                                                                        <div className="text-right font-mono text-red-600">{money(child.closingDr)}</div>
                                                                        <div className="text-right font-mono text-emerald-600">{money(child.closingCr)}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </details>
                                                    ) : row.ledgerName}
                                                </TableCell>
                                                <TableCell className="text-right text-red-600 font-mono">
                                                    {money(row.closingDr)}
                                                </TableCell>
                                                <TableCell className="text-right text-emerald-600 font-mono">
                                                    {money(row.closingCr)}
                                                </TableCell>
                                            </TableRow>
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
        </div>
    )
}
