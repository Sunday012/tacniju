import { notFound } from "next/navigation"
import { getAccountGroups, getLedgerBalances, getLedgers } from "@/app/management/actions"
import { getLedgerTransactions } from "@/app/accounting/actions"
import { InfoRecordProfile } from "@/components/accounting/info-record-profile"

export default async function LedgerProfilePage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { start?: string; end?: string }
}) {
  const [groups, ledgers, balances] = await Promise.all([getAccountGroups(), getLedgers(), getLedgerBalances()])
  const ledger = ledgers.find(item => item.id === params.id)

  if (!ledger) notFound()

  const group = groups.find(item => item.id === ledger.group_id)
  const currentYear = new Date().getFullYear()
  const startDate = searchParams.start || `${currentYear}-01-01`
  const endDate = searchParams.end || `${currentYear}-12-31`
  const transactions = await getLedgerTransactions(ledger.id, startDate, endDate)
  const balance = balances[ledger.id]
  const currentBalance = balance
    ? `NGN${balance.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${balance.type}`
    : `NGN${Number(ledger.opening_balance || 0).toFixed(2)} ${ledger.balance_type}`

  return (
    <InfoRecordProfile
      title={ledger.name}
      subtitle="Ledger profile"
      backHref="/accounting/info/ledger"
      backLabel="Ledgers"
      metrics={[
        { label: "Current Balance", value: currentBalance },
        { label: "Status", value: ledger.active ? "Active" : "Inactive" },
      ]}
      details={[
        {
          title: "Details",
          fields: [
            { label: "Name", value: ledger.name },
            { label: "Status", value: ledger.active ? "Active" : "Inactive" },
          ],
        },
        {
          title: "More Information",
          fields: [
            { label: "Group", value: group?.name || "-" },
            { label: "Balance Type", value: ledger.balance_type },
            { label: "Description", value: ledger.description || "-" },
            { label: "Current Balance", value: currentBalance },
          ],
        },
      ]}
      transactionRows={transactions}
      transactionStartDate={startDate}
      transactionEndDate={endDate}
      comment={ledger.description || "No extra notes added for this ledger yet."}
      transactionDisplayMode="ledger-party"
      deleteLedgerId={ledger.id}
      deleteLabel="Ledger"
      adjustLedgerId={ledger.id}
      adjustLedgerName={ledger.name}
      adjustBalance={balance}
      legacyOpeningAdjustment={{
        ledgerId: ledger.id,
        amount: Number(ledger.opening_balance || 0),
        type: ledger.balance_type,
      }}
    />
  )
}
