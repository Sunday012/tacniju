"use server"

import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { getAdminOfficeAccess, getCurrentAccessProfile } from "@/lib/access"

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createSupabaseAdminClient(url, key)
}

async function requireRoleManager() {
  const { user, profile } = await getCurrentAccessProfile()
  if (!user || !profile) return { user: null, error: "You must be signed in." }

  const access = await getAdminOfficeAccess(profile)
  if (!access.canManagePermissions) return { user, error: "Only super admins can manage admin roles." }

  const adminSupabase = createAdminClient()
  if (!adminSupabase) return { user, error: "Missing service role configuration." }

  return { user, adminSupabase, error: null }
}

export async function assignAdminRole(formData: FormData) {
  const profileId = String(formData.get("profile_id") || "").trim()
  const roleId = String(formData.get("role_id") || "").trim()
  if (!profileId || !roleId) return { error: "Select a member and a role." }

  const { user, adminSupabase, error } = await requireRoleManager()
  if (error || !user || !adminSupabase) return { error }

  const { error: upsertError } = await adminSupabase
    .from("admin_user_roles")
    .upsert(
      {
        profile_id: profileId,
        role_id: roleId,
        assigned_by: user.id,
        active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "profile_id,role_id" }
    )

  if (upsertError) return { error: upsertError.message }

  revalidatePath("/admin/system/roles")
  revalidatePath("/admin", "layout")
  return { success: true }
}

export async function revokeAdminRole(formData: FormData) {
  const assignmentId = String(formData.get("assignment_id") || "").trim()
  if (!assignmentId) return { error: "Select a role assignment." }

  const { adminSupabase, error } = await requireRoleManager()
  if (error || !adminSupabase) return { error }

  const { error: updateError } = await adminSupabase
    .from("admin_user_roles")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("id", assignmentId)

  if (updateError) return { error: updateError.message }

  revalidatePath("/admin/system/roles")
  revalidatePath("/admin", "layout")
  return { success: true }
}
