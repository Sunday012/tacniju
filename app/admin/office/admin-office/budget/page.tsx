import { getAccountingPrograms } from "@/app/accounting/actions"
import { getBudgetSheet, getBudgetSheets } from "@/app/accounting/programs/budget/actions"
import { BudgetListManager } from "@/app/accounting/programs/budget/budget-list-manager"
import { AdminBudgetFrame } from "@/components/admin/admin-budget-frame"

export default async function AdminBudgetPage() {
  const [sheets, programs] = await Promise.all([getBudgetSheets(), getAccountingPrograms()])
  const details = await Promise.all(sheets.map((sheet) => getBudgetSheet(sheet.id)))
  const boxDetails = details.filter((detail): detail is NonNullable<typeof detail> => detail !== null)

  return (
    <AdminBudgetFrame title="Budget" description="Create and review monthly and program budgets.">
      <BudgetListManager sheets={sheets} programs={programs} boxDetails={boxDetails} />
    </AdminBudgetFrame>
  )
}
