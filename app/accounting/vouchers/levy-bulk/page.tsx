import { AccountingShell } from "@/components/accounting/accounting-shell"
import { createClient } from "@/lib/server"
import { isGuestProfile } from "@/lib/profile-kind"
import { LevyBulkManager } from "./levy-bulk-manager"

export default async function BulkLevyVoucherPage() {
  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, reservation_number, rank, district, assembly, member_role, department, office_position")
    .order("full_name", { ascending: true })

  const members = (profiles || []).filter((profile) => !isGuestProfile(profile))

  return (
    <AccountingShell
      title="Bulk Levy"
      framed={false}
      backHref="/accounting/vouchers"
      backLabel="Vouchers"
    >
      <p className="mb-6 text-lg font-medium text-slate-500">
        Create levy receivables for workers, executives, regular members, or a custom list.
      </p>
      <LevyBulkManager members={members} />
    </AccountingShell>
  )
}
