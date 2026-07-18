import { AccountingShell } from "@/components/accounting/accounting-shell"
import { VoucherDesigner } from "@/components/accounting/voucher-designer"

export default function VoucherDesignerPage() {
  return (
    <AccountingShell title="New Creation" framed={false}>
      <VoucherDesigner />
    </AccountingShell>
  )
}
