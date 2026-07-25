"use server"

import { createClient as createServerClient } from "@/lib/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { isGuestProfile } from "@/lib/profile-kind"

function getAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!serviceRoleKey || !supabaseUrl) return null
  return createSupabaseClient(supabaseUrl, serviceRoleKey)
}

export async function assignMemberToDepartmentAction(profileId: string, department: string | null) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const { data: adminProfile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
  if (!adminProfile?.is_admin && user.email !== "sundayfavour997@gmail.com") {
    return { success: false, error: "Only admins can assign departments." }
  }

  const adminSupabase = getAdminClient()
  if (!adminSupabase) return { success: false, error: "Server config error" }

  const nextDepartment = department?.trim() || null
  const { data: targetProfile, error: profileError } = await adminSupabase
    .from("profiles")
    .select("rank, district, assembly, email")
    .eq("id", profileId)
    .maybeSingle()

  if (profileError) return { success: false, error: profileError.message }
  if (!targetProfile) return { success: false, error: "Member not found" }
  if (isGuestProfile(targetProfile)) return { success: false, error: "Guests cannot be assigned to departments." }

  const { error } = await adminSupabase
    .from("profiles")
    .update({ department: nextDepartment })
    .eq("id", profileId)

  if (error) return { success: false, error: error.message }

  revalidatePath("/admin/departments")
  revalidatePath("/admin")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function setMemberDepartmentMembershipAction(profileId: string, department: string, assigned: boolean) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const { data: adminProfile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
  if (!adminProfile?.is_admin && user.email !== "sundayfavour997@gmail.com") {
    return { success: false, error: "Only admins can assign departments." }
  }

  const adminSupabase = getAdminClient()
  if (!adminSupabase) return { success: false, error: "Server config error" }

  const departmentName = department.trim()
  if (!departmentName) return { success: false, error: "Department is required." }

  if (assigned) {
    const { error } = await adminSupabase
      .from("profile_departments")
      .upsert({ profile_id: profileId, department: departmentName, is_head: false }, { onConflict: "profile_id,department" })
    if (error) return { success: false, error: error.message }
  } else {
    const { error } = await adminSupabase
      .from("profile_departments")
      .delete()
      .eq("profile_id", profileId)
      .eq("department", departmentName)
    if (error) return { success: false, error: error.message }
  }

  revalidatePath("/admin/departments")
  revalidatePath("/admin")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function setMemberDepartmentHeadAction(profileId: string, department: string, isHead: boolean) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const { data: adminProfile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
  if (!adminProfile?.is_admin && user.email !== "sundayfavour997@gmail.com") {
    return { success: false, error: "Only admins can set department heads." }
  }

  const adminSupabase = getAdminClient()
  if (!adminSupabase) return { success: false, error: "Server config error" }
  const departmentName = department.trim()
  if (!departmentName) return { success: false, error: "Department is required." }

  const { error } = await adminSupabase
    .from("profile_departments")
    .upsert({ profile_id: profileId, department: departmentName, is_head: isHead }, { onConflict: "profile_id,department" })

  if (error) return { success: false, error: error.message }

  revalidatePath("/admin/departments")
  revalidatePath("/admin")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function getDepartmentAssignments() {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("profile_departments")
    .select("profile_id, department, is_head")

  if (error) return { rows: [] as Array<{ profile_id: string; department: string; is_head: boolean }>, error: error.message }
  return { rows: (data || []) as Array<{ profile_id: string; department: string; is_head: boolean }>, error: null }
}

export async function setDepartmentHeadAction(department: string, headProfileId: string | null) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const { data: adminProfile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
  if (!adminProfile?.is_admin && user.email !== "sundayfavour997@gmail.com") {
    return { success: false, error: "Only admins can set a department head." }
  }

  const adminSupabase = getAdminClient()
  if (!adminSupabase) return { success: false, error: "Server config error" }

  const departmentName = department.trim()
  if (!departmentName) return { success: false, error: "Department is required." }
  const headTitle = `${departmentName} Head`

  await adminSupabase
    .from("profiles")
    .update({ office_position: null })
    .eq("department", departmentName)
    .eq("office_position", headTitle)

  if (headProfileId) {
    const { error } = await adminSupabase
      .from("profiles")
      .update({ department: departmentName, office_position: headTitle })
      .eq("id", headProfileId)

    if (error) return { success: false, error: error.message }
  }

  revalidatePath("/admin/departments")
  revalidatePath("/admin")
  revalidatePath("/dashboard")
  return { success: true }
}
