import { notFound } from "next/navigation"
import { getAccountGroups, getLedgers } from "@/app/management/actions"
import { getLedgerTransactions } from "@/app/accounting/actions"
import { InfoRecordProfile } from "@/components/accounting/info-record-profile"

export default async function LedgerProfilePage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { start?: string; end?: string }
}) {
  const [groups, ledgers] = await Promise.all([getAccountGroups(), getLedgers()])
  const ledger = ledgers.find(item => item.id === params.id)

  if (!ledger) notFound()

  const group = groups.find(item => item.id === ledger.group_id)
  const currentYear = new Date().getFullYear()
  const startDate = searchParams.start || `${currentYear}-01-01`
  const endDate = searchParams.end || `${currentYear}-12-31`
  const transactions = await getLedgerTransactions(ledger.id, startDate, endDate)

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
      transactionRows={transactions}
      transactionStartDate={startDate}
      transactionEndDate={endDate}
      comment={ledger.description || "No extra notes added for this ledger yet."}
    />
  )
}
