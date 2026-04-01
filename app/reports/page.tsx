import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function ReportsDashboard() {
    const reports = [
        {
            title: "Day Book",
            href: "/reports/day-book",
            description: "View all transactions recorded on a specific day in chronological order."
        },
        {
            title: "Trial Balance",
            href: "/reports/trial-balance",
            description: "Check the mathematical accuracy of your bookkeeping with a summary of all ledger balances."
        },
        {
            title: "Ledger Statement",
            href: "/reports/ledger",
            description: "Detailed drill-down of transactions for a specific ledger account."
        },
        {
            title: "Income & Expenditure (P&L)",
            href: "/reports/profit-loss",
            description: "Analyze the financial performance showing incomes vs expenses."
        },
        {
            title: "Balance Sheet",
            href: "/reports/balance-sheet",
            description: "View the financial position (Assets = Liabilities + Equity) at a given date."
        }
    ]

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Financial Reports</h1>
                    <p className="text-slate-500 dark:text-slate-400">Generate and view essential accounting statements.</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {reports.map(report => (
                        <Link key={report.title} href={report.href}>
                            <Card className="bg-slate-900/80 border-slate-800 hover:border-emerald-500/50 transition-colors h-full cursor-pointer">
                                <CardHeader>
                                    <CardTitle className="text-xl text-emerald-400">{report.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-slate-400 line-clamp-3">
                                        {report.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
