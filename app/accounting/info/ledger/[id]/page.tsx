import { notFound } from "next/navigation"
import { getAccountGroups, getLedgers } from "@/app/management/actions"
import { InfoRecordProfile } from "@/components/accounting/info-record-profile"

export default async function LedgerProfilePage({ params }: { params: { id: string } }) {
  const [groups, ledgers] = await Promise.all([getAccountGroups(), getLedgers()])
  const ledger = ledgers.find(item => item.id === params.id)

  if (!ledger) notFound()

  const group = groups.find(item => item.id === ledger.group_id)

  return (
    <InfoRecordProfile
      title={ledger.name}
      subtitle="Ledger profile"
      backHref="/accounting/info/ledger"
      backLabel="Ledgers"
      metrics={[
        { label: "Opening Balance", value: `NGN${Number(ledger.opening_balance || 0).toFixed(2)}` },
        { label: "Balance Type", value: ledger.balance_type },
      ]}
      details={[
        {
          title: "Details",
          fields: [
            { label: "Group", value: group?.name || "-" },
            { label: "Balance Type", value: ledger.balance_type },
            { label: "Source", value: ledger.source_context || "accounting" },
            { label: "Status", value: ledger.active ? "Active" : "Inactive" },
          ],
        },
        {
          title: "More Information",
          fields: [
            { label: "Description", value: ledger.description || "-" },
            { label: "Ledger Kind", value: ledger.ledger_kind || "ledger" },
            { label: "Cash / Bank", value: ledger.is_cash_bank ? "Yes" : "No" },
            { label: "Opening Balance", value: `NGN${Number(ledger.opening_balance || 0).toFixed(2)}` },
          ],
        },
      ]}
      transactionItems={[
        `Group: ${group?.name || "-"}`,
        `Balance Type: ${ledger.balance_type}`,
        `Ledger Kind: ${ledger.ledger_kind || "ledger"}`,
      ]}
      comment={ledger.description || "No extra notes added for this ledger yet."}
    />
  )
}
