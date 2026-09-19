import Link from "next/link";
import { AccountingShell } from "@/components/accounting/accounting-shell";
import { getLedgerBalances, getLedgers } from "@/app/management/actions";

export default async function AccountBankDetailsPage() {
  const [ledgers, balances] = await Promise.all([getLedgers(), getLedgerBalances()]);
  const banks = ledgers.filter((ledger) => ledger.ledger_kind === "bank" || ledger.is_cash_bank);
  return <AccountingShell title="Bank Details" backHref="/accounting/info/account" backLabel="Account">
    <div className="overflow-x-auto border border-slate-200 bg-white"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Account Name</th><th className="px-4 py-3">Bank</th><th className="px-4 py-3">Account Number</th><th className="px-4 py-3">Account Holder</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3 text-right">Balance</th></tr></thead><tbody className="divide-y divide-slate-100">{banks.map((bank) => { const balance = balances[bank.id]; const signed = balance ? (balance.type === "Cr" ? -balance.amount : balance.amount) : 0; return <tr key={bank.id}><td className="px-4 py-4 font-bold text-slate-900"><Link className="hover:text-indigo-700" href={`/accounting/info/bank-account/${bank.id}`}>{bank.name}</Link></td><td className="px-4 py-4">{bank.bank_name || "-"}</td><td className="px-4 py-4 font-mono">{bank.account_number || "-"}</td><td className="px-4 py-4">{bank.contact_person || "-"}</td><td className="px-4 py-4">{bank.phone_number || "-"}</td><td className={`px-4 py-4 text-right font-bold ${signed >= 0 ? "text-emerald-600" : "text-red-600"}`}>{signed < 0 ? "-" : ""}NGN {Math.abs(signed).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>; })}{!banks.length && <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No bank accounts have been created.</td></tr>}</tbody></table></div>
  </AccountingShell>;
}
