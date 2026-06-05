import { AccountingShell } from "@/components/accounting/accounting-shell"

export default function BalanceSheetPage() {
  return (
    <AccountingShell title="Balance Sheet">
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
        Balance Sheet report setup is ready.
      </div>
    </AccountingShell>
  )
}
