import { AccountingShell } from "@/components/accounting/accounting-shell"

export default function CashInHandStatementPage() {
  return (
    <AccountingShell title="Cash in Hand Statement" backHref="/accounting/statements" backLabel="Statements">
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
        Cash in Hand Statement setup is ready.
      </div>
    </AccountingShell>
  )
}
