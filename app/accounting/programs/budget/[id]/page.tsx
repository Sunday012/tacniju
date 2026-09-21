import { notFound } from "next/navigation"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { getBudgetSheet } from "../actions"
import { BudgetSheetManager } from "./budget-sheet-manager"

export default async function BudgetSheetPage({ params }: { params: { id: string } }) {
  const data = await getBudgetSheet(params.id)
  if (!data) notFound()
  return <AccountingShell title={data.sheet.title} backHref="/accounting/programs/budget/list" backLabel="List Budget" framed={false}><BudgetSheetManager {...data} /></AccountingShell>
}
