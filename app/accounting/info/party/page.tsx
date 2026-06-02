import { AccountingShell } from "@/components/accounting/accounting-shell"
import { PartyManager } from "@/components/accounting/party-manager"
import { getAccountingParties } from "@/app/accounting/actions"

export default async function AccountingPartyPage() {
  const parties = await getAccountingParties()

  return (
    <AccountingShell title="Parties" showTitle={false} backHref="/accounting/info" backLabel="Accounts Info">
      <PartyManager parties={parties} />
    </AccountingShell>
  )
}
