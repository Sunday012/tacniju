import { AccountingShell } from "@/components/accounting/accounting-shell"
import { LedgersManager } from "@/components/management/ledgers-manager"
import { getAccountGroups, getLedgers } from "@/app/management/actions"

export default async function AccountingBankAccountPage() {
  const [groups, ledgers] = await Promise.all([
    getAccountGroups(),
    getLedgers(),
  ])

  return (
    <AccountingShell title="Bank Accounts" framed={false} backHref="/accounting/info" backLabel="Accounts Info">
      <LedgersManager groups={groups} ledgers={ledgers} mode="banks" hideTitle />
    </AccountingShell>
  )
}
