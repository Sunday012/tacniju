import { AccountingShell } from "@/components/accounting/accounting-shell"
import { GroupsManager } from "@/components/management/groups-manager"
import { getAccountGroups, getLedgers } from "@/app/management/actions"

export default async function AccountingGroupPage() {
  const [groups, ledgers] = await Promise.all([
    getAccountGroups(),
    getLedgers(),
  ])

  return (
    <AccountingShell title="Groups" framed={false} backHref="/accounting/info" backLabel="Accounts Info">
      <GroupsManager groups={groups} ledgers={ledgers} hideTitle />
    </AccountingShell>
  )
}
