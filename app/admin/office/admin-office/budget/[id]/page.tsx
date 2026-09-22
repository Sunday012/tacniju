import { notFound } from "next/navigation"
import { getBudgetSheet } from "@/app/accounting/programs/budget/actions"
import { BudgetSheetManager } from "@/app/accounting/programs/budget/[id]/budget-sheet-manager"
import { AdminBudgetFrame } from "@/components/admin/admin-budget-frame"

export default async function AdminBudgetSheetPage({ params }: { params: { id: string } }) {
  const data = await getBudgetSheet(params.id)
  if (!data) notFound()
  return <AdminBudgetFrame title={data.sheet.title} description="Add groups and items, then compare budgeted and actual amounts." backHref="/admin/office/admin-office/budget/list" backLabel="Back to List Budget"><BudgetSheetManager {...data} /></AdminBudgetFrame>
}
