import { notFound } from "next/navigation"
import { getAccountingParties, getLedgerTransactions, getOrCreateProfilePartyLedger } from "@/app/accounting/actions"
import { InfoRecordProfile } from "@/components/accounting/info-record-profile"

export default async function PartyProfilePage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { start?: string; end?: string }
}) {
  const parties = await getAccountingParties()
  const party = parties.find(item => item.id === params.id)

  if (!party) notFound()

  const ledgerId = party.ledgerId || (await getOrCreateProfilePartyLedger(party.id)).ledgerId
  const currentYear = new Date().getFullYear()
  const startDate = searchParams.start || `${currentYear}-01-01`
  const endDate = searchParams.end || `${currentYear}-12-31`
  const transactions = await getLedgerTransactions(ledgerId, startDate, endDate)

  return (
    <InfoRecordProfile
      title={party.name}
      subtitle="Party profile"
      backHref="/accounting/info/party"
      backLabel="Parties"
      metrics={[
        { label: "Debit", value: `NGN${transactions.reduce((sum, item) => sum + item.debitAmount, 0).toFixed(2)}` },
        { label: "Credit", value: `NGN${transactions.reduce((sum, item) => sum + item.creditAmount, 0).toFixed(2)}` },
      ]}
      details={[
        {
          title: "Details",
          fields: [
            { label: "Name", value: party.name },
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
    />
  )
}
