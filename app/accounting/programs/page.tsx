import { AccountingShell } from "@/components/accounting/accounting-shell"
import { ProgramsManager } from "@/components/accounting/programs-manager"
import { getAccountingPrograms } from "@/app/accounting/actions"

export default async function AccountingProgramsPage() {
  const programs = await getAccountingPrograms()

  return (
    <AccountingShell title="Programs" showTitle={false}>
      <ProgramsManager programs={programs} />
    </AccountingShell>
  )
}
