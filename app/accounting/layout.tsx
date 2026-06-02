import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"

export default async function AccountingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/admin-login")

  return children
}
