import { redirect } from "next/navigation"
import { getCurrentAccessProfile, isAccounting } from "@/lib/access"

export default async function AccountingLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getCurrentAccessProfile()

  if (!user) redirect("/auth/admin-login")
  if (!isAccounting(profile)) redirect("/dashboard")

  return children
}
