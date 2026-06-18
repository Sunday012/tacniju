import { redirect } from "next/navigation"
import { getCurrentAccessProfile, isAccounting } from "@/lib/access"
import { SensitiveSectionGate } from "@/components/admin/sensitive-section-gate"

export default async function AccountingLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getCurrentAccessProfile()

  if (!user) redirect("/auth/admin-login")
  if (!isAccounting(profile)) redirect("/dashboard")

  return (
    <SensitiveSectionGate section="accounting" title="Accounting Password">
      {children}
    </SensitiveSectionGate>
  )
}
