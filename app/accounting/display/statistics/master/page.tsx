import { AccountingShell } from "@/components/accounting/accounting-shell"
import { getAccountGroups, getLedgers } from "@/app/management/actions"
import { getAccountingParties } from "@/app/accounting/actions"

export default async function MasterStatisticsPage() {
  const [groups, ledgers, parties] = await Promise.all([getAccountGroups(), getLedgers(), getAccountingParties()])
  const rows = [
    { label: "Groups", total: groups.length },
    { label: "Ledgers", total: ledgers.filter(ledger => ledger.ledger_kind !== "party").length },
    { label: "Parties", total: parties.length },
  ]

  return (
    <AccountingShell title="Master Statistics" backHref="/accounting/display/statement-of-accounts" backLabel="Statement of Accounts">
      <div className="divide-y rounded-xl border bg-white">
        {rows.map(row => (
          <div key={row.label} className="grid grid-cols-[1fr_160px] px-4 py-3 text-sm">
            <div className="font-black">{row.label}</div>
            <div className="text-right font-mono font-bold">{row.total.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </AccountingShell>
  )
}
