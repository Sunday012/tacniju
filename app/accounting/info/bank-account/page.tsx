import { AccountingShell } from "@/components/accounting/accounting-shell"
import { LedgersManager } from "@/components/management/ledgers-manager"
import { getAccountGroups, getLedgerBalances, getLedgers } from "@/app/management/actions"

export default async function AccountingBankAccountPage() {
  const [groups, ledgers, balances] = await Promise.all([
    getAccountGroups(),
    getLedgers(),
    getLedgerBalances(),
  ])

  return (
    <AccountingShell title="Bank Accounts" framed={false} backHref="/accounting/info" backLabel="Accounts Info">
      <LedgersManager groups={groups} ledgers={ledgers} balances={balances} mode="banks" hideTitle />
    </AccountingShell>
  )
}
