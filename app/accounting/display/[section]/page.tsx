import { notFound } from "next/navigation"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { AccountJumpSearch } from "@/components/accounting/account-jump-search"
import { getLedgers } from "@/app/management/actions"
import { DisplayMenuList, displayMenuItems, getDisplayMenuSection } from "../display-menu"

export function generateStaticParams() {
  return displayMenuItems
    .filter(item => item.slug)
    .map(item => ({ section: item.slug as string }))
}

export default async function AccountingDisplaySectionPage({ params }: { params: { section: string } }) {
  const section = getDisplayMenuSection(params.section)

  if (!section?.children) {
    notFound()
  }

  const showAccountJump = params.section === "account-book"
  const jumpLedgers = showAccountJump
    ? (await getLedgers())
        .filter(ledger => ledger.ledger_kind !== "party")
        .map(ledger => ({
          id: ledger.id,
          name: ledger.name,
          isBank: Boolean(ledger.is_cash_bank) || ledger.ledger_kind === "bank",
          groupName: ledger.account_groups?.name ?? null,
        }))
    : []

  return (
    <AccountingShell title={section.label} backHref="/accounting/display" backLabel="Display">
      {showAccountJump && <AccountJumpSearch ledgers={jumpLedgers} />}
      <DisplayMenuList items={section.children} />
    </AccountingShell>
  )
}
