import { AccountingShell } from "@/components/accounting/accounting-shell"

export default function BankStatementPage() {
  return (
    <AccountingShell title="Bank Statement" backHref="/accounting/statements" backLabel="Statements">
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
        Bank Statement setup is ready.
      </div>
    </AccountingShell>
  )
}
