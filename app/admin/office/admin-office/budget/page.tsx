import { getAccountingPrograms } from "@/app/accounting/actions"
import { getBudgetSheet, getBudgetSheets } from "@/app/accounting/programs/budget/actions"
import { BudgetListManager } from "@/app/accounting/programs/budget/budget-list-manager"
import { AdminBudgetFrame } from "@/components/admin/admin-budget-frame"
import { createClient } from "@/lib/server"

export default async function AdminBudgetPage() {
  const supabase = await createClient()
  const [sheets, programs, { data: events }] = await Promise.all([getBudgetSheets(), getAccountingPrograms(), supabase.from("events").select("id, name, event_date").order("event_date", { ascending: false })])
  const details = await Promise.all(sheets.map((sheet) => getBudgetSheet(sheet.id)))
  const boxDetails = details.filter((detail): detail is NonNullable<typeof detail> => detail !== null)

  return (
    <AdminBudgetFrame title="Budget" description="Create and review monthly and program budgets.">
      <BudgetListManager sheets={sheets} programs={programs} events={events || []} boxDetails={boxDetails} />
    </AdminBudgetFrame>
  )
}
