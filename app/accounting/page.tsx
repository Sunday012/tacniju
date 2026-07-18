import { createClient } from "@/lib/server"
import { AccountingGateway } from "@/components/accounting/accounting-gateway"
import { isMainAdmin } from "@/lib/access"

export default async function AccountingDashboard() {
  const supabase = await createClient()

  const cookieStore = require("next/headers").cookies()
  const activeOrgId = cookieStore.get("active_org_id")?.value
  let orgName = "TACN Iju"
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from("profiles").select("is_admin, email").eq("id", user.id).maybeSingle()
    : { data: null }
  const dashboardHref = isMainAdmin({ ...profile, email: profile?.email || user?.email }) ? "/admin" : "/dashboard"

  if (activeOrgId) {
    const { data: org } = await supabase.from("organizations").select("name").eq("id", activeOrgId).maybeSingle()
    orgName = org?.name || orgName
  }

  return <AccountingGateway orgName={orgName} dashboardHref={dashboardHref} />
}
