import { AccountingShell } from "@/components/accounting/accounting-shell"
import { getAccountingPrograms } from "@/app/accounting/actions"
import { getBudgetSheets } from "../actions"
import { BudgetListManager } from "../budget-list-manager"

export default async function ListBudgetPage() {
  const [sheets, programs] = await Promise.all([getBudgetSheets(), getAccountingPrograms()])
  return <AccountingShell title="List Budget" backHref="/accounting/programs/budget" backLabel="Budget"><BudgetListManager sheets={sheets} programs={programs} /></AccountingShell>
}
