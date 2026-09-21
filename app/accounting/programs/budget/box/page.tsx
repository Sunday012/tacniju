import Link from "next/link"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { getBudgetSheet, getBudgetSheets } from "../actions"

const money = (value: number) => value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default async function BoxBudgetPage() {
  const sheets = await getBudgetSheets()
  const details = await Promise.all(sheets.map((sheet) => getBudgetSheet(sheet.id)))
  return <AccountingShell title="Box Budget" backHref="/accounting/programs/budget" backLabel="Budget" framed={false}><div className="space-y-6">{details.filter(Boolean).map((data) => {
    const budget = data!.items.reduce((sum, item) => sum + Number(item.budget_amount || 0), 0)
    const actual = data!.items.reduce((sum, item) => sum + Number(item.actual_amount || 0), 0)
    return <section key={data!.sheet.id} className="overflow-x-auto border border-slate-300 bg-white shadow-sm"><header className="flex items-center justify-between gap-4 border-b border-slate-300 bg-slate-50 px-5 py-4"><div><p className="text-xs font-bold uppercase text-slate-500">{data!.sheet.budget_type} Budget</p><Link href={`/accounting/programs/budget/${data!.sheet.id}`} className="font-extrabold text-slate-900 hover:text-indigo-700">{data!.sheet.title}</Link></div><strong className="font-mono text-slate-900">Grand Total: NGN {money(budget)}</strong></header><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-white text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Income / Expenses</th><th className="px-4 py-3 text-right">Budget Amount</th><th className="px-4 py-3 text-right">Actual Amount</th><th className="px-4 py-3 text-right">Difference</th></tr></thead><tbody className="divide-y divide-slate-100">{data!.items.map((item) => <tr key={item.id}><td className="px-4 py-3 font-semibold text-slate-800">{item.name}</td><td className="px-4 py-3 text-right font-mono">NGN {money(Number(item.budget_amount || 0))}</td><td className="px-4 py-3 text-right font-mono">NGN {money(Number(item.actual_amount || 0))}</td><td className={`px-4 py-3 text-right font-mono ${Number(item.budget_amount || 0) - Number(item.actual_amount || 0) >= 0 ? "text-emerald-700" : "text-rose-700"}`}>NGN {money(Number(item.budget_amount || 0) - Number(item.actual_amount || 0))}</td></tr>)}<tr className="bg-slate-50"><td className="px-4 py-3 font-extrabold">Grand Total</td><td className="px-4 py-3 text-right font-mono font-extrabold">NGN {money(budget)}</td><td className="px-4 py-3 text-right font-mono font-extrabold">NGN {money(actual)}</td><td className="px-4 py-3 text-right font-mono font-extrabold">NGN {money(budget - actual)}</td></tr></tbody></table></section>
  })}{!sheets.length && <div className="border border-slate-200 bg-white px-5 py-12 text-center text-slate-400">Create a budget to see its box report.</div>}</div></AccountingShell>
}
