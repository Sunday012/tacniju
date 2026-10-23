import { ClipboardCheck, ReceiptText, WalletCards } from "lucide-react"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { AccountingMenuList } from "@/components/accounting/accounting-menu-list"

const voucherCards = [
  { href: "/accounting/vouchers/receipt", label: "Receipt", icon: ReceiptText },
  { href: "/accounting/vouchers/payment", label: "Payment", icon: WalletCards },
  { href: "/accounting/vouchers/receipt-note", label: "Receipt Note", icon: ClipboardCheck },
  { href: "/accounting/vouchers/contra", label: "Contra", icon: WalletCards },
]

export default function AccountingVouchersPage() {
  return (
    <AccountingShell title="Accounting Vouchers">
      <AccountingMenuList items={voucherCards} />
    </AccountingShell>
  )
}
