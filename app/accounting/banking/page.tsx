import { AccountingShell } from "@/components/accounting/accounting-shell"
import { LedgersManager } from "@/components/management/ledgers-manager"
import { getAccountGroups, getLedgers } from "@/app/management/actions"

export default async function AccountingBankingPage() {
  const [groups, ledgers] = await Promise.all([getAccountGroups(), getLedgers()])

  return (
    <AccountingShell title="Banking" framed={false}>
      <LedgersManager groups={groups} ledgers={ledgers} mode="banks" hideTitle />
    </AccountingShell>
  )
}
