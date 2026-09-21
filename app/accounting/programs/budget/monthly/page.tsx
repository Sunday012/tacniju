import { AccountingShell } from "@/components/accounting/accounting-shell"
import { getAccountingPrograms } from "@/app/accounting/actions"
import { getBudgetSheets } from "../actions"
import { BudgetListManager } from "../budget-list-manager"

export default async function MonthlyBudgetPage() {
  const [sheets, programs] = await Promise.all([getBudgetSheets("Monthly"), getAccountingPrograms()])
  return <AccountingShell title="Monthly Budget" backHref="/accounting/programs/budget" backLabel="Budget"><BudgetListManager sheets={sheets} programs={programs} type="Monthly" /></AccountingShell>
}
