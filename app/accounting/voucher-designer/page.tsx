import { AccountingShell } from "@/components/accounting/accounting-shell"
import { VoucherDesigner } from "@/components/accounting/voucher-designer"
import { getCreationTemplates } from "@/app/accounting/voucher-designer/actions"

export const dynamic = "force-dynamic"

export default async function VoucherDesignerPage() {
  const { templates, error } = await getCreationTemplates("accounting")

  return (
    <AccountingShell title="New Creation" framed={false}>
      {error && <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">Run `scripts/046_create_custom_creation_templates.sql` in Supabase.</div>}
      <VoucherDesigner templates={templates} defaultScope="accounting" />
    </AccountingShell>
  )
}
