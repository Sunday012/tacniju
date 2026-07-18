import { notFound } from "next/navigation"
import { getAccountingParties, getLedgerTransactions, getOrCreateProfilePartyLedger } from "@/app/accounting/actions"
import { getLedgerBalances } from "@/app/management/actions"
import { InfoRecordProfile } from "@/components/accounting/info-record-profile"

export default async function PartyProfilePage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { start?: string; end?: string }
}) {
  const [parties, balances] = await Promise.all([
    getAccountingParties(),
    getLedgerBalances(),
  ])
  const party = parties.find(item => item.id === params.id)

  if (!party) notFound()

  const ledgerId = party.ledgerId || (await getOrCreateProfilePartyLedger(party.id)).ledgerId
  const currentYear = new Date().getFullYear()
  const startDate = searchParams.start || `${currentYear}-01-01`
  const endDate = searchParams.end || `${currentYear}-12-31`
  const transactions = await getLedgerTransactions(ledgerId, startDate, endDate)
  const balance = balances[ledgerId]
  const currentBalance = balance
    ? `NGN${balance.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${balance.type}`
    : "NGN0.00 Dr"

  return (
    <InfoRecordProfile
      title={party.name}
      subtitle="Party profile"
      backHref="/accounting/info/party"
      backLabel="Parties"
      metrics={[
        { label: "Current Balance", value: currentBalance },
        { label: "Statement Period", value: `${startDate} to ${endDate}` },
      ]}
      details={[
        {
          title: "Details",
          fields: [
            { label: "Name", value: party.name },
            { label: "Current Balance", value: currentBalance },
          ],
        },
        {
          title: "More Information",
          fields: [
            { label: "Phone", value: party.phone_number || "-" },
            { label: "Reservation", value: party.reservation_number || "-" },
            { label: "Linked Ledger", value: ledgerId },
          ],
        },
      ]}
      transactionRows={transactions}
      transactionStartDate={startDate}
      transactionEndDate={endDate}
      comment="No comments added yet."
      transactionDisplayMode="ledger-party"
      deleteLedgerId={ledgerId}
      deleteLabel="Party"
      adjustLedgerId={ledgerId}
      adjustLedgerName={party.name}
      adjustBalance={balance}
    />
  )
}
