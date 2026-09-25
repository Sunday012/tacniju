import Link from "next/link"
import { ArrowLeft, Landmark } from "lucide-react"

import { getLedgerBalances, getLedgers } from "@/app/management/actions"

export const dynamic = "force-dynamic"

function money(value: number) {
  return `NGN ${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default async function TreasuryPage() {
  const [ledgers, balances] = await Promise.all([getLedgers(), getLedgerBalances()])
  const banks = ledgers
    .filter((ledger) => Boolean(ledger.is_cash_bank) || ledger.ledger_kind === "bank")
    .map((ledger) => {
      const balance = balances[ledger.id]
      const signedBalance = balance
        ? (balance.type === "Cr" ? -balance.amount : balance.amount)
        : (ledger.balance_type === "Cr" ? -Number(ledger.opening_balance || 0) : Number(ledger.opening_balance || 0))
      return { ...ledger, signedBalance }
    })
    .sort((a, b) => b.signedBalance - a.signedBalance)
  const total = banks.reduce((sum, bank) => sum + bank.signedBalance, 0)

  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10">
      <div className="w-full space-y-8">
        <div>
          <Link href="/admin/office/admin-office/records" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-700">
            <ArrowLeft className="h-4 w-4" /> Back to Records & Reports
          </Link>
          <p className="mt-8 text-xs font-black uppercase tracking-widest text-indigo-600">Head Office</p>
          <div className="mt-2 flex flex-col gap-4 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Treasury</h1>
              <p className="mt-2 text-slate-500">Current balances for every cash and bank account.</p>
            </div>
            <div className="border border-slate-300 bg-white px-5 py-3 text-right">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Combined Position</p>
              <p className={`mt-1 font-mono text-xl font-black ${total < 0 ? "text-rose-600" : "text-emerald-700"}`}>
                {total < 0 ? "-" : ""}{money(total)}
              </p>
            </div>
          </div>
        </div>

        {banks.length === 0 ? (
          <div className="border border-slate-200 bg-white px-6 py-14 text-center text-sm font-semibold text-slate-500">No bank accounts have been created.</div>
        ) : (
          <div className="grid gap-px overflow-hidden border border-slate-300 bg-slate-300 sm:grid-cols-2 xl:grid-cols-3">
            {banks.map((bank) => (
              <Link key={bank.id} href={`/accounting/info/bank-account/${bank.id}`} className="group bg-white p-5 hover:bg-slate-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-slate-200 bg-slate-50 text-slate-600">
                      <Landmark className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate font-extrabold text-slate-900 group-hover:text-indigo-700">{bank.name}</h2>
                      <p className="truncate text-xs font-semibold text-slate-500">{bank.bank_name || "Cash account"}</p>
                    </div>
                  </div>
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${bank.signedBalance < 0 ? "bg-rose-500" : "bg-emerald-500"}`} />
                </div>
                <p className={`mt-7 font-mono text-2xl font-black ${bank.signedBalance < 0 ? "text-rose-600" : "text-emerald-700"}`}>
                  {bank.signedBalance < 0 ? "-" : ""}{money(bank.signedBalance)}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs">
                  <div><p className="font-black uppercase text-slate-400">Account No.</p><p className="mt-1 truncate font-semibold text-slate-700">{bank.account_number || "-"}</p></div>
                  <div><p className="font-black uppercase text-slate-400">Holder</p><p className="mt-1 truncate font-semibold text-slate-700">{bank.contact_person || "-"}</p></div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
