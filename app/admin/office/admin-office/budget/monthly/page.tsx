import { getAccountingPrograms } from "@/app/accounting/actions"
import { getBudgetSheets } from "@/app/accounting/programs/budget/actions"
import { BudgetListManager } from "@/app/accounting/programs/budget/budget-list-manager"
import { AdminBudgetFrame } from "@/components/admin/admin-budget-frame"

export default async function AdminMonthlyBudgetPage() {
  const [sheets, programs] = await Promise.all([getBudgetSheets("Monthly"), getAccountingPrograms()])
  return <AdminBudgetFrame title="Monthly Budget" description="Create and manage the monthly operating budget." backHref="/admin/office/admin-office/budget" backLabel="Back to Budget"><BudgetListManager sheets={sheets} programs={programs} type="Monthly" /></AdminBudgetFrame>
}
