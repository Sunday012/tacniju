import { AccountingShell } from "@/components/accounting/accounting-shell"

export default function PartyStatementPage() {
  return (
    <AccountingShell title="Party Statement" backHref="/accounting/statements" backLabel="Statements">
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
        Party Statement setup is ready.
      </div>
    </AccountingShell>
  )
}
