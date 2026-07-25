"use server"

import { cookies } from "next/headers"
import { createClient } from "@/lib/server"

export async function getAccountingOrgId() {
  const supabase = await createClient()
  const cookieStore = cookies()
  const activeOrgId = cookieStore.get("active_org_id")?.value

  if (activeOrgId) {
    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("id", activeOrgId)
      .maybeSingle()

    if (org?.id) return org.id as string
  }

  const { data: firstOrg, error } = await supabase
    .from("organizations")
    .select("id")
    .order("name", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error || !firstOrg?.id) {
    throw new Error("Create at least one church before using accounting.")
  }

  return firstOrg.id as string
}
