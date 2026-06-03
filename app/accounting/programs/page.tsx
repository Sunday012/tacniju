import { AccountingShell } from "@/components/accounting/accounting-shell"
import { ProgramsManager } from "@/components/accounting/programs-manager"
import { getAccountingPrograms } from "@/app/accounting/actions"

export default async function AccountingProgramsPage() {
  const programs = await getAccountingPrograms()

  return (
    <AccountingShell title="Programs" framed={false}>
      <ProgramsManager programs={programs} hideTitle />
    </AccountingShell>
  )
}
