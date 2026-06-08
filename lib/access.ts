import { createClient } from "@/lib/server"

export type AccessProfile = {
  is_admin?: boolean | null
  department?: string | null
  member_role?: string | null
  email?: string | null
}

export function isMainAdmin(profile?: AccessProfile | null) {
  return !!profile?.is_admin || profile?.email === "sundayfavour997@gmail.com"
}

export function isUshering(profile?: AccessProfile | null) {
  return isMainAdmin(profile) || profile?.department === "Ushering"
}

export function isAccounting(profile?: AccessProfile | null) {
  return isMainAdmin(profile) || profile?.department === "Account Unit"
}

export async function getCurrentAccessProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { supabase, user: null, profile: null }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, department, member_role, email")
    .eq("id", user.id)
    .maybeSingle()

  return { supabase, user, profile: { ...profile, email: profile?.email || user.email } }
}
