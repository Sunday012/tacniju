import { notFound } from "next/navigation"
import { getAccountGroups, getLedgers } from "@/app/management/actions"
import { InfoRecordProfile } from "@/components/accounting/info-record-profile"

export default async function GroupProfilePage({ params }: { params: { id: string } }) {
  const [groups, ledgers] = await Promise.all([getAccountGroups(), getLedgers()])
  const group = groups.find(item => item.id === params.id)

  if (!group) notFound()

  const childGroups = groups.filter(item => item.parent_id === group.id)
  const linkedLedgers = ledgers.filter(item => item.group_id === group.id)
  const parentGroup = group.parent_id ? groups.find(item => item.id === group.parent_id) : null

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
      transactionItems={[
        ...linkedLedgers.slice(0, 8).map(item => `Ledger: ${item.name}`),
        ...childGroups.slice(0, 8).map(item => `Child Group: ${item.name}`),
      ]}
      comment="This page gives you a quick view of how the group is structured and what records are tied to it."
    />
  )
}
