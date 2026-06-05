import { notFound } from "next/navigation"
import { getAccountingParties } from "@/app/accounting/actions"
import { InfoRecordProfile } from "@/components/accounting/info-record-profile"

export default async function PartyProfilePage({ params }: { params: { id: string } }) {
  const parties = await getAccountingParties()
  const party = parties.find(item => item.id === params.id)

  if (!party) notFound()

  const sourceLabel = party.ledgerId ? "Manual Party" : "Auto Party"

  return (
    <InfoRecordProfile
      title={party.name}
      subtitle="Party profile"
      backHref="/accounting/info/party"
      backLabel="Parties"
      metrics={[
        { label: "Reservation", value: party.reservation_number || "-" },
        { label: "Phone", value: party.phone_number || "-" },
      ]}
      details={[
        {
          title: "Details",
          fields: [
            { label: "Name", value: party.name },
            { label: "Phone", value: party.phone_number || "-" },
            { label: "Reservation Number", value: party.reservation_number || "-" },
            { label: "Source", value: sourceLabel },
          ],
        },
        {
          title: "Contact Persons",
          fields: [
            { label: "Primary Contact", value: party.name },
            { label: "Mobile", value: party.phone_number || "-" },
            { label: "Linked Ledger", value: party.ledgerId || "-" },
            { label: "Status", value: sourceLabel },
          ],
        },
      ]}
      transactionItems={[
        `Source: ${sourceLabel}`,
        `Phone: ${party.phone_number || "-"}`,
        `Reservation: ${party.reservation_number || "-"}`,
      ]}
      comment="This page gives you a clean personal view for the selected party record."
    />
  )
}
