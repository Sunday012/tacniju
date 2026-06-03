import { getTrialBalance } from "@/app/reports/actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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
                        <CardTitle className="text-xl">Account Balances</CardTitle>
                        <CardDescription>
                            As of {searchParams.end ? new Date(searchParams.end).toLocaleDateString() : 'Today'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader className="bg-slate-50 [&_th]:px-5 [&_th]:py-3.5 [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-600">
                                <TableRow className="border-slate-200">
                                    <TableHead className="text-slate-500">Ledger</TableHead>
                                    <TableHead className="text-slate-500">Group</TableHead>
                                    <TableHead className="text-slate-500">Nature</TableHead>
                                    <TableHead className="text-slate-500 text-right">Debit Balance (₦)</TableHead>
                                    <TableHead className="text-slate-500 text-right">Credit Balance (₦)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="[&_td]:px-5 [&_td]:py-3.5 [&_tr:hover]:bg-slate-50/60">
                                {data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-slate-500 py-6">No data found.</TableCell>
                                    </TableRow>
                                ) : (
                                    data.map((row, idx) => (
                                        <TableRow key={idx} className="border-slate-200">
                                            <TableCell className="font-medium text-slate-800">{row.ledgerName}</TableCell>
                                            <TableCell className="text-slate-500">{row.groupName}</TableCell>
                                            <TableCell className="text-slate-500 text-xs uppercase tracking-wider">{row.nature}</TableCell>
                                            <TableCell className="text-right text-emerald-400 font-mono">
                                                {row.closingDr > 0 ? row.closingDr.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right text-red-400 font-mono">
                                                {row.closingCr > 0 ? row.closingCr.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                                <TableRow className="border-t-2 border-slate-300 bg-slate-50">
                                    <TableCell colSpan={3} className="text-right font-bold text-slate-800 uppercase tracking-widest text-sm py-4">
                                        Total
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-emerald-400 font-mono text-lg py-4">
                                        {totalDr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-red-400 font-mono text-lg py-4">
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
