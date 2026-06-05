import { notFound } from "next/navigation"
import { getAccountGroups, getLedgers } from "@/app/management/actions"
import { getLedgerTransactions } from "@/app/accounting/actions"
import { InfoRecordProfile } from "@/components/accounting/info-record-profile"

export default async function BankAccountProfilePage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { start?: string; end?: string }
}) {
  const [groups, ledgers] = await Promise.all([getAccountGroups(), getLedgers()])
  const account = ledgers.find(item => item.id === params.id && (item.ledger_kind === "bank" || item.is_cash_bank))

  if (!account) notFound()

  const group = groups.find(item => item.id === account.group_id)
  const currentYear = new Date().getFullYear()
  const startDate = searchParams.start || `${currentYear}-01-01`
  const endDate = searchParams.end || `${currentYear}-12-31`
  const transactions = await getLedgerTransactions(account.id, startDate, endDate)

  return (
    <InfoRecordProfile
      title={account.name}
      subtitle="Bank account profile"
      backHref="/accounting/info/bank-account"
      backLabel="Bank Accounts"
      metrics={[
        { label: "Opening Balance", value: `NGN${Number(account.opening_balance || 0).toFixed(2)}` },
        { label: "Account Number", value: account.account_number || "-" },
      ]}
      details={[
        {
          title: "Details",
          fields: [
            { label: "Bank Name", value: account.bank_name || "-" },
            { label: "Group", value: group?.name || "-" },
            { label: "Contact Person", value: account.contact_person || "-" },
            { label: "Phone", value: account.phone_number || "-" },
          ],
        },
        {
          title: "More Information",
          fields: [
            { label: "Balance Type", value: account.balance_type },
            { label: "Opening Balance", value: `NGN${Number(account.opening_balance || 0).toFixed(2)}` },
            { label: "Description", value: account.description || "-" },
            { label: "Status", value: account.active ? "Active" : "Inactive" },
          ],
        },
      ]}
      transactionRows={transactions}
      transactionStartDate={startDate}
      transactionEndDate={endDate}
      comment={account.description || "No extra notes added for this bank account yet."}
    />
  )
}
