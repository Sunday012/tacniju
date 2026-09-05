import { AccountingShell } from "@/components/accounting/accounting-shell"
import { ProgramsManager } from "@/components/accounting/programs-manager"
import { getAccountingPrograms } from "@/app/accounting/actions"

export default async function AccountingProgramEventsPage() {
  const programs = await getAccountingPrograms()

  return (
    <AccountingShell title="Events" framed={false} backHref="/accounting/programs" backLabel="Programs">
      <ProgramsManager programs={programs} hideTitle />
    </AccountingShell>
  )
}
