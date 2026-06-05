import { notFound } from "next/navigation"
import { getAccountGroups, getLedgers } from "@/app/management/actions"
import { getTransactionsForLedgers } from "@/app/accounting/actions"
import { InfoRecordProfile } from "@/components/accounting/info-record-profile"

export default async function GroupProfilePage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { start?: string; end?: string }
}) {
  const [groups, ledgers] = await Promise.all([getAccountGroups(), getLedgers()])
  const group = groups.find(item => item.id === params.id)

  if (!group) notFound()

  const childGroups = groups.filter(item => item.parent_id === group.id)
  const linkedLedgers = ledgers.filter(item => item.group_id === group.id)
  const parentGroup = group.parent_id ? groups.find(item => item.id === group.parent_id) : null
  const currentYear = new Date().getFullYear()
  const startDate = searchParams.start || `${currentYear}-01-01`
  const endDate = searchParams.end || `${currentYear}-12-31`
  const transactions = await getTransactionsForLedgers(linkedLedgers.map(item => item.id), startDate, endDate)

  return (
    <InfoRecordProfile
      title={group.name}
      subtitle="Account group profile"
      backHref="/accounting/info/group"
      backLabel="Groups"
      metrics={[
        { label: "Linked Ledgers", value: String(linkedLedgers.length) },
        { label: "Child Groups", value: String(childGroups.length) },
      ]}
      details={[
        {
          title: "Details",
          fields: [
            { label: "Nature", value: group.nature },
            { label: "Parent Group", value: parentGroup?.name || "Primary Group" },
            { label: "Structure", value: childGroups.length > 0 ? "Parent Group" : "Leaf Group" },
            { label: "Usage", value: linkedLedgers.length > 0 ? "In Use" : "No Ledgers Yet" },
          ],
        },
        {
          title: "More Information",
          fields: [
            { label: "Group ID", value: group.id },
            { label: "Linked Ledger Total", value: String(linkedLedgers.length) },
            { label: "Child Group Total", value: String(childGroups.length) },
            { label: "Parent", value: parentGroup?.name || "-" },
          ],
        },
      ]}
      transactionRows={transactions}
      transactionStartDate={startDate}
      transactionEndDate={endDate}
      comment="This page gives you a quick view of how the group is structured and what records are tied to it."
    />
  )
}
