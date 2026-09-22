import { redirect } from "next/navigation"

export default async function BudgetSheetPage({ params }: { params: { id: string } }) {
  redirect(`/admin/office/admin-office/budget/${params.id}`)
}
