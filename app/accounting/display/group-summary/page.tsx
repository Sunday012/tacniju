import { AccountingShell } from "@/components/accounting/accounting-shell"
import { getAccountGroups, getLedgerBalances, getLedgers } from "@/app/management/actions"
import { GroupSummaryTable, type GroupSummaryRow } from "@/components/accounting/group-summary-table"

export default async function GroupSummaryPage() {
  const [groups, ledgers, balances] = await Promise.all([
    getAccountGroups(),
    getLedgers(),
    getLedgerBalances(),
  ])

  const signedBalance = (ledger: any) => {
    const balance = balances[ledger.id]
    if (balance) return balance.type === "Cr" ? -balance.amount : balance.amount
    return ledger.balance_type === "Cr" ? -Number(ledger.opening_balance || 0) : Number(ledger.opening_balance || 0)
  }

  const rows: GroupSummaryRow[] = groups
    .map(group => {
      const groupLedgers = ledgers.filter(ledger => ledger.group_id === group.id)
      const total = groupLedgers.reduce((sum, ledger) => sum + signedBalance(ledger), 0)
      return {
        id: group.id,
        name: group.name,
        nature: group.nature,
        ledgerCount: groupLedgers.length,
        debit: total > 0 ? total : 0,
        credit: total < 0 ? -total : 0,
        href: `/accounting/info/group/${group.id}`,
      }
    })
    .sort((a, b) => a.nature.localeCompare(b.nature) || a.name.localeCompare(b.name))

  return (
    <AccountingShell
      title="Group Summary"
      backHref="/accounting/display/account-book"
      backLabel="Account Book"
      framed={false}
    >
      <GroupSummaryTable rows={rows} emptyLabel="No account groups yet." />
    </AccountingShell>
  )
}
