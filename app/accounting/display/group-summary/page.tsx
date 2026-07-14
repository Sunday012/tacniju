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

  // Consolidate groups that share the same name + nature (e.g. duplicate
  // "Parties" groups) into a single summary line.
  const consolidated = new Map<string, { id: string; name: string; nature: string; ledgerCount: number; total: number }>()
  for (const group of groups) {
    const groupLedgers = ledgers.filter(ledger => ledger.group_id === group.id)
    const total = groupLedgers.reduce((sum, ledger) => sum + signedBalance(ledger), 0)
    const key = `${group.nature}::${group.name.trim().toLowerCase()}`
    const existing = consolidated.get(key)
    if (existing) {
      existing.ledgerCount += groupLedgers.length
      existing.total += total
    } else {
      consolidated.set(key, {
        id: group.id,
        name: group.name,
        nature: group.nature,
        ledgerCount: groupLedgers.length,
        total,
      })
    }
  }

  const rows: GroupSummaryRow[] = Array.from(consolidated.values())
    .map(entry => ({
      id: entry.id,
      name: entry.name,
      nature: entry.nature,
      ledgerCount: entry.ledgerCount,
      debit: entry.total > 0 ? entry.total : 0,
      credit: entry.total < 0 ? -entry.total : 0,
      href: `/accounting/info/group/${entry.id}`,
    }))
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
