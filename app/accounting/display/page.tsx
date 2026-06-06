import { AccountingShell } from "@/components/accounting/accounting-shell"
import { DisplayMenuList, displayMenuItems } from "./display-menu"

export default function AccountingDisplayPage() {
  return (
    <AccountingShell title="Display">
      <DisplayMenuList items={displayMenuItems} />
    </AccountingShell>
  )
}
