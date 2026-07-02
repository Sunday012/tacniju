import { AccountingShell } from "@/components/accounting/accounting-shell"
import { PartyManager } from "@/components/accounting/party-manager"
import { getAccountingParties } from "@/app/accounting/actions"
import { getLedgerBalances } from "@/app/management/actions"

export default async function AccountingPartyPage() {
  const [parties, balances] = await Promise.all([
    getAccountingParties(),
    getLedgerBalances(),
  ])

  return (
    <AccountingShell title="Parties" framed={false} backHref="/accounting/info" backLabel="Accounts Info">
      <PartyManager parties={parties} balances={balances} hideTitle />
    </AccountingShell>
  )
}
