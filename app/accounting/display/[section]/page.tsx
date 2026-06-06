import { notFound } from "next/navigation"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { DisplayMenuList, displayMenuItems, getDisplayMenuSection } from "../display-menu"

export function generateStaticParams() {
  return displayMenuItems
    .filter(item => item.slug)
    .map(item => ({ section: item.slug as string }))
}

export default function AccountingDisplaySectionPage({ params }: { params: { section: string } }) {
  const section = getDisplayMenuSection(params.section)

  if (!section?.children) {
    notFound()
  }

  return (
    <AccountingShell title={section.label} backHref="/accounting/display" backLabel="Display">
      <DisplayMenuList items={section.children} />
    </AccountingShell>
  )
}
