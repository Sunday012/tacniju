import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { MetroSecretaryWorkspace } from "@/components/metro/secretary-workspace"
import { getMetroWorkspaceData } from "./actions"

export default async function MetroSecretaryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/admin-login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!profile?.is_admin) redirect("/dashboard")

  const data = await getMetroWorkspaceData()

  return <MetroSecretaryWorkspace data={data} />
}
