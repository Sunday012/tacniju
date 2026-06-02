import { createClient } from "@/lib/server"
import { AccountingGateway } from "@/components/accounting/accounting-gateway"

export default async function AccountingDashboard() {
  const supabase = await createClient()

  const cookieStore = require("next/headers").cookies()
  const activeOrgId = cookieStore.get("active_org_id")?.value
  let orgName = "TACN Iju"

  if (activeOrgId) {
    const { data: org } = await supabase.from("organizations").select("name").eq("id", activeOrgId).maybeSingle()
    orgName = org?.name || orgName
  }

  return <AccountingGateway orgName={orgName} />
}
